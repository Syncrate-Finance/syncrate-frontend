require('dotenv').config();
const { createPublicClient, http, parseAbiItem, formatUnits } = require('viem');
const { base } = require('viem/chains');
const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIG
// ==========================================
const WEEKLY_TOTAL = 10_000_000n;
const MINTER_POOL = 7_000_000n; // 70%
const PRIME_POOL  = 3_000_000n; // 30%

const ENGINE = '0x37c0078D297243A22ac247cd93f1cafed9Dbe461';
const SYSGLD = '0xbA93Aa354a3B47A936d713b8FB90126D4d35546B';

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
});

const SGLD_MINTED = parseAbiItem(
  'event SGLDMinted(address indexed user, address token, uint256 sgldAmount, uint256 stablecoinAmount)'
);
const SGLD_REDEEMED_IMMEDIATE = parseAbiItem(
  'event SGLDRedeemedImmediate(address indexed user, address stablecoin, uint256 sgldAmount, uint256 netOwed, uint256 fee)'
);
const SGLD_REDEMPTION_QUEUED = parseAbiItem(
  'event SGLDRedemptionQueued(uint256 indexed index, address indexed user, address stablecoin, uint256 sgldAmount, uint256 netOwed)'
);
const TRANSFER = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)'
);

// ==========================================
// WEEK BOUNDS (last completed Sunday → Sunday)
// ==========================================
function getWeekBounds() {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day, 0, 0, 0));
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 7);

  return {
    startTs: Math.floor(start.getTime() / 1000),
    endTs: Math.floor(end.getTime() / 1000),
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

async function getLogs(address, event, fromBlock, toBlock) {
  const logs = [];
  const step = 2000n;
  for (let from = fromBlock; from <= toBlock; from += step) {
    const to = from + step - 1n > toBlock ? toBlock : from + step - 1n;
    try {
      const chunk = await client.getLogs({ address, event, fromBlock: from, toBlock: to });
      logs.push(...chunk);
    } catch (e) {
      console.warn(`Log fetch warning (${from}-${to}):`, e.message);
    }
  }
  return logs;
}

// ==========================================
// MAIN
// ==========================================
async function main() {
  const { startTs, endTs, startDate, endDate } = getWeekBounds();
  console.log(`\n=== SGLD Points — Week ${startDate} → ${endDate} ===\n`);

  const latestBlock = await client.getBlockNumber();
  // ~7-10 days of Base blocks (adjust if needed)
  const fromBlock = latestBlock > 60000n ? latestBlock - 60000n : 0n;

  console.log('Fetching mint & redeem events...');
  const [mintLogs, redeemImmLogs, redeemQueuedLogs] = await Promise.all([
    getLogs(ENGINE, SGLD_MINTED, fromBlock, latestBlock),
    getLogs(ENGINE, SGLD_REDEEMED_IMMEDIATE, fromBlock, latestBlock),
    getLogs(ENGINE, SGLD_REDEMPTION_QUEUED, fromBlock, latestBlock),
  ]);

  // Filter by timestamp
  async function inWeek(log) {
    const block = await client.getBlock({ blockNumber: log.blockNumber });
    return Number(block.timestamp) >= startTs && Number(block.timestamp) < endTs;
  }

  const mints = [];
  for (const log of mintLogs) {
    if (await inWeek(log)) mints.push(log);
  }

  const redeems = [];
  for (const log of [...redeemImmLogs, ...redeemQueuedLogs]) {
    if (await inWeek(log)) redeems.push(log);
  }

  console.log(`Mints in week: ${mints.length}`);
  console.log(`Redeems in week: ${redeems.length}`);

  // Net mint per wallet
  const netMint = new Map();
  for (const log of mints) {
    const user = log.args.user.toLowerCase();
    netMint.set(user, (netMint.get(user) || 0n) + log.args.sgldAmount);
  }
  for (const log of redeems) {
    const user = log.args.user.toLowerCase();
    netMint.set(user, (netMint.get(user) || 0n) - log.args.sgldAmount);
  }

  const positiveNet = new Map();
  let totalNet = 0n;
  for (const [user, amount] of netMint) {
    if (amount > 0n) {
      positiveNet.set(user, amount);
      totalNet += amount;
    }
  }

  console.log(`Positive net minters: ${positiveNet.size}`);
  console.log(`Total net SGLD: ${formatUnits(totalNet, 18)}`);

  // Snapshot sySGLD holders
  console.log('\nSnapshotting sySGLD balances...');
  const transferLogs = await getLogs(SYSGLD, TRANSFER, fromBlock, latestBlock);
  const holders = new Set();
  for (const log of transferLogs) {
    if (log.args.to && log.args.to !== '0x0000000000000000000000000000000000000000') {
      holders.add(log.args.to.toLowerCase());
    }
    if (log.args.from && log.args.from !== '0x0000000000000000000000000000000000000000') {
      holders.add(log.args.from.toLowerCase());
    }
  }

  const primeBalances = new Map();
  let totalPrime = 0n;
  const balanceOfAbi = [{
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  }];

  for (const holder of holders) {
    try {
      const bal = await client.readContract({
        address: SYSGLD,
        abi: balanceOfAbi,
        functionName: 'balanceOf',
        args: [holder],
      });
      if (bal > 0n) {
        primeBalances.set(holder, bal);
        totalPrime += bal;
      }
    } catch (_) {}
  }

  console.log(`sySGLD holders > 0: ${primeBalances.size}`);
  console.log(`Total sySGLD: ${formatUnits(totalPrime, 18)}`);

  // Distribute points
  const results = [];

  if (totalNet > 0n) {
    for (const [user, amount] of positiveNet) {
      const pts = (amount * MINTER_POOL) / totalNet;
      results.push({
        address: user,
        netMinted: formatUnits(amount, 18),
        minterPoints: Number(pts),
        primePoints: 0,
        totalPoints: Number(pts),
      });
    }
  }

  if (totalPrime > 0n) {
    for (const [user, bal] of primeBalances) {
      const pts = (bal * PRIME_POOL) / totalPrime;
      const existing = results.find((r) => r.address === user);
      if (existing) {
        existing.primePoints = Number(pts);
        existing.totalPoints += Number(pts);
      } else {
        results.push({
          address: user,
          netMinted: '0',
          minterPoints: 0,
          primePoints: Number(pts),
          totalPoints: Number(pts),
        });
      }
    }
  }

  results.sort((a, b) => b.totalPoints - a.totalPoints);

  const output = {
    weekStart: startDate,
    weekEnd: endDate,
    calculatedAt: new Date().toISOString(),
    totalMinterPointsDistributed: Number(MINTER_POOL),
    totalPrimePointsDistributed: Number(PRIME_POOL),
    totalNetMinted: formatUnits(totalNet, 18),
    totalPrimeSupply: formatUnits(totalPrime, 18),
    leaderboard: results,
  };

  // Write to public so the frontend can read it
  const outDir = path.join(process.cwd(), 'public', 'points');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, 'latest.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  // Also keep a dated copy
  fs.writeFileSync(path.join(outDir, `week-${startDate}.json`), JSON.stringify(output, null, 2));

  console.log(`\nSaved → public/points/latest.json`);
  console.log(`Top 5:`);
  results.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.address.slice(0, 10)}... ${Math.round(r.totalPoints).toLocaleString()} pts`);
  });
  console.log('\nDone. Commit & push public/points/latest.json, then redeploy.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});