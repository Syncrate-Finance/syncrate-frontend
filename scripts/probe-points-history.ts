import { pointsClient } from '../server/points/chain';
import { diagnosePointsFailure } from '../server/points/diagnostics';

// Read-only capability probes; never print provider messages or key-bearing URLs.
if (process.env.POINTS_RPC_URL) {
  const client=pointsClient();
  for(const [name,fromBlock,toBlock] of [
    ['deployment-logs',49128017n,49128116n],
    ['week-ending-logs',53350827n,53350926n],
  ] as const){
    try{
      const logs=await client.getLogs({address:'0x10C5E0643bCc6C915Cad0335f70A96c1532766eb',fromBlock,toBlock});
      console.log(JSON.stringify({probe:name,status:'ok',count:logs.length}));
    }catch(error){console.log(JSON.stringify({probe:name,...diagnosePointsFailure(error)}))}
  }
}
try{
  const url='https://base.blockscout.com/api?module=logs&action=getLogs&address=0x10C5E0643bCc6C915Cad0335f70A96c1532766eb&fromBlock=49128017&toBlock=53350926';
  const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)console.log(JSON.stringify({probe:'explorer-events',httpStatus:response.status}));
  else{
    const body=await response.json() as {status?:string;result?:unknown[]};
    console.log(JSON.stringify({probe:'explorer-events',status:body.status==='1'&&Array.isArray(body.result)&&body.result.length<1000?'ok':'incomplete',count:Array.isArray(body.result)?body.result.length:undefined}));
  }
}catch{console.log(JSON.stringify({probe:'explorer-events',status:'unavailable'}))}
