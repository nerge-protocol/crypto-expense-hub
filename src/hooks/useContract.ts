// ============================================
// Hook: useContract.ts - Contract Hook
// ============================================

import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWalletClient, usePublicClient } from 'wagmi';
import { CONTRACTS, ABIS, getContractByName } from '../lib/contracts';

export function useContract(contractName: 'escrowManager' | 'expenseVerifier', chain: 'ethereum' | 'arbitrum' | 'base' | 'tron' | 'solana' = 'base') {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    return useMemo(() => {
        // const chain = chainId === 42161 ? 'arbitrum' : 'arbitrumSepolia';
        const contractInfo = getContractByName(chain);
        const address = contractInfo[contractName]; // CONTRACTS[chain][contractName];
        const abi = ABIS[contractName];

        if (!address) {
            throw new Error(`Contract ${contractName} not found for chain ${chain}`);
        }

        // Read-only contract (for queries)
        const readContract = new ethers.Contract(
            address,
            abi,
            new ethers.JsonRpcProvider(contractInfo.rpcUrl)
        );

        // Write contract (for transactions) - needs signer
        let writeContractFunc: Function = () => { throw new Error("Wallet not connected"); };

        if (walletClient) {
            writeContractFunc = async function () {
                const { account, chain, transport } = walletClient;
                const network = {
                    chainId: chain.id,
                    name: chain.name,
                    ensAddress: chain.contracts?.ensRegistry?.address,
                };
                const provider = new ethers.BrowserProvider(transport, network);
                const signer = new ethers.JsonRpcSigner(provider, account.address);
                const contract = new ethers.Contract(address, abi, signer);
                return contract;
            };
        } else if (typeof window !== 'undefined' && (window as any).ethereum) {
            // Fallback for legacy dapps or when wagmi isn't fully initialized but metamask is present
            // This path is less safe but kept for backward compatibility if needed, 
            // though walletClient should be preferred.
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            writeContractFunc = async function () {
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(address, abi, signer);
                return contract;
            };
        }

        return {
            address,
            readContract,
            writeContractFunc,
            abi
        };
    }, [contractName, chain, walletClient]);
}