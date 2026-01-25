import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  USDT_ADDRESSES, 
  MERCHANT_ADDRESSES, 
  ERC20_ABI, 
  parseUSDTAmount,
  getExplorerTxUrl 
} from '@/lib/usdt-contracts';
import type { ChainType } from '@/types/merchant';

interface TransferState {
  isTransferring: boolean;
  txHash: string | null;
  error: string | null;
  status: 'idle' | 'pending' | 'confirming' | 'success' | 'failed';
}

interface UseTokenTransferReturn extends TransferState {
  transferUSDT: (chain: ChainType, amount: string, merchantAddress?: string) => Promise<string | null>;
  reset: () => void;
  getExplorerUrl: (chain: ChainType, hash: string) => string;
}

export function useTokenTransfer(): UseTokenTransferReturn {
  const [state, setState] = useState<TransferState>({
    isTransferring: false,
    txHash: null,
    error: null,
    status: 'idle',
  });

  // Transfer USDT on EVM chains (Base, Arbitrum)
  const transferEVM = useCallback(async (
    chain: ChainType,
    amount: string,
    merchantAddress: string
  ): Promise<string> => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      throw new Error('No wallet detected');
    }

    const usdtAddress = USDT_ADDRESSES[chain];
    const parsedAmount = parseUSDTAmount(amount, chain);

    // Encode the transfer function call
    const transferData = `0xa9059cbb${merchantAddress.slice(2).padStart(64, '0')}${parsedAmount.toString(16).padStart(64, '0')}`;

    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No connected account');
    }

    // Send the transaction
    const txHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: accounts[0],
        to: usdtAddress,
        data: transferData,
        // Gas will be estimated by the wallet
      }],
    });

    return txHash;
  }, []);

  // Transfer USDT on Tron (TRC20)
  const transferTron = useCallback(async (
    amount: string,
    merchantAddress: string
  ): Promise<string> => {
    const tronWeb = (window as any).tronWeb;
    if (!tronWeb) {
      throw new Error('TronLink not detected');
    }

    const usdtAddress = USDT_ADDRESSES.tron;
    const parsedAmount = parseUSDTAmount(amount, 'tron');

    // Create the contract instance
    const contract = await tronWeb.contract().at(usdtAddress);
    
    // Call the transfer function
    const result = await contract.transfer(merchantAddress, parsedAmount.toString()).send({
      feeLimit: 100_000_000, // 100 TRX fee limit
      callValue: 0,
      shouldPollResponse: false,
    });

    return result;
  }, []);

  // Transfer USDT on Solana (SPL Token)
  const transferSolana = useCallback(async (
    amount: string,
    merchantAddress: string
  ): Promise<string> => {
    const solana = (window as any).solana;
    if (!solana || !solana.isPhantom) {
      throw new Error('Phantom wallet not detected');
    }

    // For Solana SPL transfers, we need @solana/web3.js and @solana/spl-token
    // This is a simplified version - in production, you'd use proper SPL token transfer
    
    // Import required modules dynamically
    const { Connection, PublicKey, Transaction } = await import('@solana/web3.js');
    const { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
    
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    const usdtMint = new PublicKey(USDT_ADDRESSES.solana);
    const fromPubkey = new PublicKey(solana.publicKey.toString());
    const toPubkey = new PublicKey(merchantAddress);
    
    // Get associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(usdtMint, fromPubkey);
    const toTokenAccount = await getAssociatedTokenAddress(usdtMint, toPubkey);
    
    const parsedAmount = parseUSDTAmount(amount, 'solana');
    
    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      fromPubkey,
      BigInt(parsedAmount.toString()),
      [],
      TOKEN_PROGRAM_ID
    );
    
    // Create and sign transaction
    const transaction = new Transaction().add(transferInstruction);
    transaction.feePayer = fromPubkey;
    
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    
    // Sign with Phantom
    const signedTransaction = await solana.signTransaction(transaction);
    
    // Send transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
  }, []);

  // Main transfer function
  const transferUSDT = useCallback(async (
    chain: ChainType,
    amount: string,
    merchantAddress?: string
  ): Promise<string | null> => {
    const toAddress = merchantAddress || MERCHANT_ADDRESSES[chain];
    
    if (!toAddress) {
      toast.error('Invalid merchant address');
      return null;
    }

    setState({
      isTransferring: true,
      txHash: null,
      error: null,
      status: 'pending',
    });

    try {
      let txHash: string;

      setState(prev => ({ ...prev, status: 'pending' }));
      toast.info('Please confirm the transaction in your wallet...');

      switch (chain) {
        case 'base':
        case 'arbitrum':
          txHash = await transferEVM(chain, amount, toAddress);
          break;
        case 'tron':
          txHash = await transferTron(amount, toAddress);
          break;
        case 'solana':
          txHash = await transferSolana(amount, toAddress);
          break;
        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }

      setState({
        isTransferring: false,
        txHash,
        error: null,
        status: 'success',
      });

      toast.success('Transaction submitted successfully!');
      return txHash;

    } catch (error: any) {
      console.error('Transfer error:', error);
      
      let errorMessage = 'Transaction failed';
      
      if (error.code === 4001 || error.message?.includes('rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient token balance';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setState({
        isTransferring: false,
        txHash: null,
        error: errorMessage,
        status: 'failed',
      });

      toast.error(errorMessage);
      return null;
    }
  }, [transferEVM, transferTron, transferSolana]);

  const reset = useCallback(() => {
    setState({
      isTransferring: false,
      txHash: null,
      error: null,
      status: 'idle',
    });
  }, []);

  const getExplorerUrl = useCallback((chain: ChainType, hash: string) => {
    return getExplorerTxUrl(chain, hash);
  }, []);

  return {
    ...state,
    transferUSDT,
    reset,
    getExplorerUrl,
  };
}
