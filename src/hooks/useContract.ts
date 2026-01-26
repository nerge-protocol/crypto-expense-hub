// ============================================
// Hook: useContract.ts - Contract Hook
// ============================================

import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWalletClient, usePublicClient } from 'wagmi';
import { CONTRACTS, ABIS } from '../lib/contracts';

export function useContract(contractName: 'escrowManager' | 'expenseVerifier', chainId?: number) {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();

    return useMemo(() => {
        const chain = chainId === 42161 ? 'arbitrum' : 'arbitrumSepolia';
        const address = CONTRACTS[chain][contractName];
        const abi = ABIS[contractName];

        if (!address) {
            throw new Error(`Contract ${contractName} not found for chain ${chainId}`);
        }

        // Read-only contract (for queries)
        const readContract = new ethers.Contract(
            address,
            abi,
            new ethers.JsonRpcProvider(CONTRACTS[chain].rpcUrl)
        );

        // Write contract (for transactions) - needs signer
        let writeContractFunc: Function;
        if (walletClient || (typeof window !== 'undefined' && window.ethereum)) {
            const provider = new ethers.BrowserProvider(window.ethereum);

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
    }, [contractName, chainId, walletClient]);
}