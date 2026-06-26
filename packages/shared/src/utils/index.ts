import { createPublicClient, http, type Address, type Chain } from "viem";
import { anvil } from "viem/chains";

export const anvilDefaultAccount: Address =
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export const defaultChain: Chain = anvil;

export const publicClient = createPublicClient({
  chain: defaultChain,
  transport: http(),
});
