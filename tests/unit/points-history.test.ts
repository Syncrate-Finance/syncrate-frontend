import { test } from "node:test";
import assert from "node:assert/strict";
import { withPointsHistory, type PointsHistory } from "../../server/points/history-cache";
import { POINTS_POOL, POSITION_MANAGER } from "../../features/points/model";
import { CONTRACT_ADDRESSES } from "../../config/contracts";

const hash="0x"+"a".repeat(64), tx="0x"+"b".repeat(64);
function fixture():PointsHistory {
  return {version:1,chainId:8453,throughBlock:"100",throughBlockHash:hash,
    token:CONTRACT_ADDRESSES.SGLD_TOKEN.toLowerCase(),pool:POINTS_POOL,manager:POSITION_MANAGER,positionIds:[],
    logs:[{address:CONTRACT_ADDRESSES.SGLD_TOKEN.toLowerCase(),blockNumber:"0x63",blockHash:hash,transactionHash:tx,logIndex:"0x0",topics:[hash],data:"0x"}],
    receipts:[],calls:{}};
}
test("verified bootstrap joins cached and live ranges without skipping the boundary",async()=>{
  const history=fixture();const calls:unknown[]=[];let checks=0;
  const request=withPointsHistory(history,async q=>{calls.push(q);return [{blockNumber:"0x65"}]},async()=>{checks++;return {hash}});
  const result=await request({method:"eth_getLogs",params:[{address:history.token,fromBlock:"0x62",toBlock:"0x66",topics:[hash]}]}) as unknown[];
  assert.equal(result.length,2);
  assert.deepEqual(calls,[{method:"eth_getLogs",params:[{address:history.token,fromBlock:"0x65",toBlock:"0x66",topics:[hash]}]}]);
  await request({method:"eth_getLogs",params:[{address:history.token,fromBlock:"0x62",toBlock:"0x64",topics:[hash]}]});
  assert.equal(calls.length,1);assert.equal(checks,1);
});
test("bootstrap rejects changed canonical hashes and does not suppress newer RPC failures",async()=>{
  const history=fixture();
  const changed=withPointsHistory(history,async()=>[],async()=>({hash:tx}));
  await assert.rejects(changed({method:"eth_getLogs",params:[{address:history.token,fromBlock:"0x0",toBlock:"0x64"}]}),/not canonical/);
  const failed=withPointsHistory(history,async()=>{throw Error("live range failed")},async()=>({hash}));
  await assert.rejects(failed({method:"eth_getLogs",params:[{address:history.token,fromBlock:"0x63",toBlock:"0x65"}]}),/live range failed/);
});
test("duplicate cache events and unbounded manager history cannot be used",async()=>{
  const history=fixture();
  assert.throws(()=>withPointsHistory({...history,logs:[...history.logs,...history.logs]},async()=>[],async()=>({hash})),/Invalid cached/);
  const request=withPointsHistory(history,async()=>[],async()=>({hash}));
  await assert.rejects(request({method:"eth_getLogs",params:[{address:history.manager,fromBlock:"0x0",toBlock:"0x64"}]}),/Unbounded manager/);
});
test("pinned historical calls have stable argument ordering while newer calls stay live",async()=>{
  const history=fixture();history.calls[JSON.stringify(['eth_call',[{to:history.token,data:'0x18160ddd'},'0x64']])]='0x1234';
  let calls=0;const request=withPointsHistory(history,async()=>{calls++;return '0x5678'},async()=>({hash}));
  assert.equal(await request({method:'eth_call',params:[{data:'0x18160ddd',to:history.token},'0x64']}),'0x1234');
  assert.equal(await request({method:'eth_call',params:[{to:history.token,data:'0x18160ddd'},'0x65']}),'0x5678');
  assert.equal(calls,1);
});
