import { defineChain } from "viem";

/** Public network metadata. No credential-bearing RPC URLs belong here. */
export const robinhood = defineChain({
  id: 4663,
  name: "Robinhood",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
});
export type MintChainId = 8453 | 4663;
export function isMintChain(id: number | undefined): id is MintChainId {
  return id === 8453 || id === 4663;
}
