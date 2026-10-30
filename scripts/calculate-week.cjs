// Preserve the existing operator command; points now use time-weighted holdings.
require("dotenv").config({ quiet: true });
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const result = spawnSync(
  process.execPath,
  [
    path.join(__dirname, "../node_modules/tsx/dist/cli.mjs"),
    path.join(__dirname, "calculate-points.ts"),
    ...process.argv.slice(2),
  ],
  { stdio: "inherit", windowsHide: true },
);
process.exit(result.status ?? 1);
