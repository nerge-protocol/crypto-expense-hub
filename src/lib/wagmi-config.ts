import { http, createConfig } from 'wagmi';
import { base, arbitrum, mainnet } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

// WalletConnect project ID - in production, use your own from https://cloud.walletconnect.com
const projectId = '3fbb6bba6f1de962d911bb5b5c9dba88';

export const config = createConfig({
  chains: [mainnet, base, arbitrum],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
  },
});

// Chain ID mapping for our app
export const chainIdMap: Record<string, number> = {
  base: base.id,
  arbitrum: arbitrum.id,
  tron: mainnet.id, // Tron uses its own network, fallback to mainnet for demo
  solana: mainnet.id, // Solana is not EVM, handled separately
};

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
