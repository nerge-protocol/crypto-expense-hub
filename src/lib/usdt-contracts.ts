// USDT Contract Addresses and ABIs for different chains
import { parseUnits, encodeFunctionData, type Address } from 'viem';

// USDT Contract Addresses
export const USDT_ADDRESSES: Record<string, Address> = {
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base (more liquid than USDT)
  arbitrum: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT on Arbitrum
  tron: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' as Address, // USDT TRC20
  solana: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' as unknown as Address, // USDT SPL
};

// Merchant receiving addresses (in production, these would come from the API)
export const MERCHANT_ADDRESSES: Record<string, string> = {
  base: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e123',
  arbitrum: '0x742d35Cc6634C0532925a3b844Bc9e7595f1e123',
  tron: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
  solana: 'CQy8Jf9gqKjNNXcxjLCHMQgcCfHc7Dpmjz8PRxjK9s1d',
};

// Minimal ERC20 ABI for transfers
export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

// Chain configurations
export const CHAIN_CONFIGS = {
  base: {
    chainId: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    decimals: 6, // USDC uses 6 decimals
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    decimals: 6, // USDT uses 6 decimals
  },
  tron: {
    name: 'Tron',
    blockExplorer: 'https://tronscan.org',
    decimals: 6,
  },
  solana: {
    name: 'Solana',
    blockExplorer: 'https://solscan.io',
    decimals: 6,
  },
};

// Helper to parse USDT amount (6 decimals)
export function parseUSDTAmount(amount: string | number, chain: string): bigint {
  const decimals = CHAIN_CONFIGS[chain as keyof typeof CHAIN_CONFIGS]?.decimals || 6;
  return parseUnits(amount.toString(), decimals);
}

// Encode transfer data for EVM chains
export function encodeTransferData(to: Address, amount: bigint): `0x${string}` {
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [to, amount],
  });
}

// Get block explorer URL for transaction
export function getExplorerTxUrl(chain: string, txHash: string): string {
  const config = CHAIN_CONFIGS[chain as keyof typeof CHAIN_CONFIGS];
  if (!config?.blockExplorer) return '#';
  
  switch (chain) {
    case 'tron':
      return `${config.blockExplorer}/#/transaction/${txHash}`;
    case 'solana':
      return `${config.blockExplorer}/tx/${txHash}`;
    default:
      return `${config.blockExplorer}/tx/${txHash}`;
  }
}
