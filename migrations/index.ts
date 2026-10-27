import * as migration_20261027_080828_foundation from './20261027_080828_foundation';

export const migrations = [
  {
    up: migration_20261027_080828_foundation.up,
    down: migration_20261027_080828_foundation.down,
    name: '20261027_080828_foundation'
  },
];
