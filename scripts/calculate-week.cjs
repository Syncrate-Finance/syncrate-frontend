try {
  require('dotenv').config();
} catch (_) {
  // dotenv not installed — fine in CI if BASE_RPC_URL is set via secrets
}

const { createPublicClient, http, parseAbiItem, formatUnits } = require('viem');
const { base } = require('viem/chains');
const fs = require('fs');
const path = require('path');

// ==========================================
// CONFIG
// ==========================================
const MINTER_POOL = 7_000_000n; // 70%
const PRIME_POOL  = 3_000_000n; // 30%

const ENGINE = '0x37c0078D297243A22ac247cd93f1cafed9Dbe461';
const SYSGLD = '0xbA93Aa354a3B47A936d713b8FB90126D4d35546B';

const client = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
});

const SGLD_MINTED = parseAbiItem(
  'event SGLDMinted(address indexed user, address indexed collateralToken, uint256 sgldAmount, uint256 collateralSpent)'
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
  console.log(`\n=== SGLD Points — Week ${startDate} → ${endDate} (CUMULATIVE) ===\n`);

  const latestBlock = await client.getBlockNumber();
  const fromBlock = latestBlock > 350000n ? latestBlock - 350000n : 0n;

  console.log('Fetching mint & redeem events...');
  const [mintLogs, redeemImmLogs, redeemQueuedLogs] = await Promise.all([
    getLogs(ENGINE, SGLD_MINTED, fromBlock, latestBlock),
    getLogs(ENGINE, SGLD_REDEEMED_IMMEDIATE, fromBlock, latestBlock),
    getLogs(ENGINE, SGLD_REDEMPTION_QUEUED, fromBlock, latestBlock),
  ]);

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

  // Net mint per wallet (this week only)
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

  // ==========================================
  // LOAD EXISTING CUMULATIVE TOTALS
  // ==========================================
  const outDir = path.join(process.cwd(), 'public', 'points');
  const latestPath = path.join(outDir, 'latest.json');
  const previous = {};

  if (fs.existsSync(latestPath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(latestPath, 'utf-8'));
      for (const row of prev.leaderboard || []) {
        previous[row.address.toLowerCase()] = {
          totalPoints: Number(row.totalPoints) || 0,
          minterPoints: Number(row.minterPoints) || 0,
          primePoints: Number(row.primePoints) || 0,
        };
      }
      console.log(`Loaded ${Object.keys(previous).length} existing wallets`);
    } catch (e) {
      console.warn('Could not load previous leaderboard:', e.message);
    }
  }

  // ==========================================
  // THIS WEEK'S POINTS
  // ==========================================
  const weekPoints = new Map(); // address -> { minter, prime }

  if (totalNet > 0n) {
    for (const [user, amount] of positiveNet) {
      const pts = Number((amount * MINTER_POOL) / totalNet);
      weekPoints.set(user, { minter: pts, prime: 0 });
    }
  }

  if (totalPrime > 0n) {
    for (const [user, bal] of primeBalances) {
      const pts = Number((bal * PRIME_POOL) / totalPrime);
      const existing = weekPoints.get(user) || { minter: 0, prime: 0 };
      existing.prime = pts;
      weekPoints.set(user, existing);
    }
  }

  // ==========================================
  // MERGE: previous + this week
  // ==========================================
  const allAddresses = new Set([
    ...Object.keys(previous),
    ...weekPoints.keys(),
  ]);

  const results = [];
  for (const addr of allAddresses) {
    const prev = previous[addr] || { totalPoints: 0, minterPoints: 0, primePoints: 0 };
    const week = weekPoints.get(addr) || { minter: 0, prime: 0 };

    const minterPoints = prev.minterPoints + week.minter;
    const primePoints = prev.primePoints + week.prime;
    const totalPoints = minterPoints + primePoints;

    const netThisWeek = positiveNet.has(addr)
      ? formatUnits(positiveNet.get(addr), 18)
      : '0';

    results.push({
      address: addr,
      netMinted: netThisWeek,
      minterPoints,
      primePoints,
      totalPoints,
    });
  }

  results.sort((a, b) => b.totalPoints - a.totalPoints);

  const output = {
    weekStart: startDate,
    weekEnd: endDate,
    calculatedAt: new Date().toISOString(),
    cumulative: true,
    totalMinterPointsDistributed: Number(MINTER_POOL),
    totalPrimePointsDistributed: Number(PRIME_POOL),
    totalNetMinted: formatUnits(totalNet, 18),
    totalPrimeSupply: formatUnits(totalPrime, 18),
    leaderboard: results,
  };

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(latestPath, JSON.stringify(output, null, 2));
  fs.writeFileSync(
    path.join(outDir, `week-${startDate}.json`),
    JSON.stringify(output, null, 2)
  );

  console.log(`\nSaved cumulative leaderboard → public/points/latest.json`);
  console.log(`Wallets on board: ${results.length}`);
  console.log(`Top 5:`);
  results.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.address.slice(0, 10)}... ${Math.round(r.totalPoints).toLocaleString()} pts`);
  });
  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
