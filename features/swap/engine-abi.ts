// Subset of the exact-match verified SyncrateEngine implementation ABI.
// Base implementation: 0xD5c82eB3BdFb66f459F3216e53D0ED0A2B1115Ed.
// Source: https://sourcify.dev/server/v2/contract/8453/0xD5c82eB3BdFb66f459F3216e53D0ED0A2B1115Ed?fields=all
export const engineAbi = [
  {
    name: "AccessControlBadConfirmation",
    type: "error",
    inputs: [],
  },
  {
    name: "AccessControlUnauthorizedAccount",
    type: "error",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "neededRole",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    name: "AddressEmptyCode",
    type: "error",
    inputs: [
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    name: "ERC1967InvalidImplementation",
    type: "error",
    inputs: [
      {
        name: "implementation",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    name: "ERC1967NonPayable",
    type: "error",
    inputs: [],
  },
  {
    name: "EnforcedPause",
    type: "error",
    inputs: [],
  },
  {
    name: "ExpectedPause",
    type: "error",
    inputs: [],
  },
  {
    name: "FailedCall",
    type: "error",
    inputs: [],
  },
  {
    name: "InvalidInitialization",
    type: "error",
    inputs: [],
  },
  {
    name: "NotInitializing",
    type: "error",
    inputs: [],
  },
  {
    name: "SafeERC20FailedOperation",
    type: "error",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
  },
  {
    name: "SyncrateEngine__AlreadyReserved",
    type: "error",
    inputs: [],
  },
  {
    name: "SyncrateEngine__ExceedsMaxFee",
    type: "error",
    inputs: [],
  },
  {
    name: "SyncrateEngine__ExceedsReserveCap",
    type: "error",
    inputs: [],
  },
  {
    name: "SyncrateEngine__InvalidOraclePrice",
    type: "error",
    inputs: [],
  },
  {
    name: "SyncrateEngine__NoReservation",
    type: "error",
    inputs: [],
  },
  {
    name: "SyncrateEngine__QueueEmpty",
    type: "error",
    inputs: [],
  },
  {
    name: "SyncrateEngine__StaleOraclePrice",
    type: "error",
    inputs: [],
  },
  {
    name: "SyncrateEngine__TokenNotAllowed",
    type: "error",
    inputs: [],
  },
  {
    name: "SyncrateEngine__ZeroAmount",
    type: "error",
    inputs: [],
  },
  {
    name: "UUPSUnauthorizedCallContext",
    type: "error",
    inputs: [],
  },
  {
    name: "UUPSUnsupportedProxiableUUID",
    type: "error",
    inputs: [
      {
        name: "slot",
        type: "bytes32",
        internalType: "bytes32",
      },
    ],
  },
  {
    name: "SGLDMinted",
    type: "event",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "collateralToken",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sgldAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "collateralSpent",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    name: "SGLDRedeemedImmediate",
    type: "event",
    inputs: [
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "stablecoin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sgldBurned",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "stablecoinPaid",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "fee",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    name: "SGLDRedemptionQueued",
    type: "event",
    inputs: [
      {
        name: "queueIndex",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "user",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "stablecoin",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "sgldBurned",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "stablecoinOwed",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    name: "getQueueLength",
    type: "function",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "goldPriceFeed",
    type: "function",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract AggregatorV3Interface",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "isAllowedCollateral",
    type: "function",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "mint",
    type: "function",
    inputs: [
      {
        name: "stablecoinAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokenAddress",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "nextQueueIndex",
    type: "function",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "oracleStalenessThreshold",
    type: "function",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "paused",
    type: "function",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "redeem",
    type: "function",
    inputs: [
      {
        name: "sgldAmount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "stablecoinAddress",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "redeemFeeBps",
    type: "function",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "redemptionQueue",
    type: "function",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
      {
        name: "stablecoin",
        type: "address",
        internalType: "address",
      },
      {
        name: "amountOwed",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "reserveCap",
    type: "function",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "sgldToken",
    type: "function",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract ISGLDToken",
      },
    ],
    stateMutability: "view",
  },
  {
    name: "totalReserved",
    type: "function",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
] as const;
