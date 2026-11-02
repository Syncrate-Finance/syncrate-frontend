import { POINTS_POOL, POSITION_MANAGER } from "@/features/points/model";
import { CONTRACT_ADDRESSES } from "@/config/contracts";

type RpcRequest = { method: string; params?: readonly unknown[] };
type RawLog = {
  address: string; blockNumber: string; blockHash: string; transactionHash: string;
  logIndex: string; topics: string[]; data: string;
};
export type PointsHistory = {
  version: number; chainId: number; throughBlock: string; throughBlockHash: string;
  token: string; pool: string; manager: string; positionIds: string[];
  logs: RawLog[]; receipts: Array<{ transactionHash: string; blockNumber: string; blockHash: string }>;
  calls: Record<string, unknown>;
};
const hex = (value: unknown): value is string => typeof value === 'string' && /^0x[0-9a-f]+$/i.test(value);
function stable(value: unknown): string {
  if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
  if(value && typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+stable(v)).join(',')+'}';
  return JSON.stringify(value);
}
/** Immutable, receipt-verified bootstrap only. Newer reads always go to RPC.
 * Manager coverage is limited to the eligible pool's NFTs, discovered from all
 * pool Mint receipts; this adapter is exclusively for the points replay.
 */
export function withPointsHistory(
  history: PointsHistory,
  live: (request: RpcRequest) => Promise<unknown>,
  header: (block: string) => Promise<unknown>,
) {
  if(history.version!==1||history.chainId!==8453||!/^\d+$/.test(history.throughBlock)||!/^0x[0-9a-f]{64}$/.test(history.throughBlockHash))throw Error('Invalid points history cache');
  if(history.token!==CONTRACT_ADDRESSES.SGLD_TOKEN.toLowerCase()||history.pool!==POINTS_POOL||history.manager!==POSITION_MANAGER)throw Error('Unverified cache contracts');
  const through=BigInt(history.throughBlock);
  const allowed=new Set([history.token,history.pool,history.manager]);
  const seen=new Set<string>();
  for(const log of history.logs){
    const key=log.transactionHash+':'+BigInt(log.logIndex);
    if(!allowed.has(log.address.toLowerCase())||BigInt(log.blockNumber)>through||seen.has(key)||!/^0x[0-9a-f]{64}$/.test(log.blockHash))throw Error('Invalid cached points log');
    seen.add(key);
  }
  const calls=new Map(Object.entries(history.calls).map(([key,value])=>[stable(JSON.parse(key)),value]));
  let checked:Promise<void>|undefined;
  const check=()=>checked??=(async()=>{
    const block=await header('0x'+through.toString(16)) as {hash?:string};
    if(block?.hash!==history.throughBlockHash)throw Error('Historical points cache is not canonical');
  })();
  return async (request:RpcRequest):Promise<unknown>=>{
    if(request.method==='eth_call'){
      const key=stable([request.method,request.params]);
      if(calls.has(key)){await check();return calls.get(key)}
    }
    if(request.method==='eth_getTransactionReceipt'){
      const cached=history.receipts.find(x=>x.transactionHash===request.params?.[0]);
      if(cached){await check();return cached}
    }
    if(request.method!=='eth_getLogs')return live(request);
    const filter=request.params?.[0] as {address?:string|string[];fromBlock?:string;toBlock?:string;topics?:(string|string[]|null)[]}|undefined;
    if(!filter||!hex(filter.fromBlock)||!hex(filter.toBlock))return live(request);
    const addresses=(Array.isArray(filter.address)?filter.address:[filter.address]).map(x=>x?.toLowerCase());
    if(addresses.some(x=>!x||!allowed.has(x)))return live(request);
    const from=BigInt(filter.fromBlock),to=BigInt(filter.toBlock);
    if(from>through)return live(request);
    if(to<from)throw Error('Invalid cached log range');
    // The only manager reads used by the replay are per-tokenId event filters.
    if(addresses.includes(history.manager)&&(!filter.topics?.[0]||!filter.topics.some((t,i)=>i>0&&t!==null)))throw Error('Unbounded manager history is not cached');
    await check();
    const cached=history.logs.filter(log=>addresses.includes(log.address.toLowerCase())&&BigInt(log.blockNumber)>=from&&BigInt(log.blockNumber)<=to&&(filter.topics??[]).every((topic,i)=>topic===null||(Array.isArray(topic)?topic.includes(log.topics[i]):topic===log.topics[i])));
    if(to<=through)return cached;
    const recent=await live({method:'eth_getLogs',params:[{...filter,fromBlock:'0x'+(through+1n).toString(16)}]});
    if(!Array.isArray(recent))throw Error('Invalid live log result');
    return [...cached,...recent];
  };
}
