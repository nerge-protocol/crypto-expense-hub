// ============================================
// Hook: useEscrow.ts - Escrow Operations
// ============================================

import { useState } from 'react';
import { ethers } from 'ethers';
import { useContract } from './useContract';
import { CONTRACTS, ABIS } from '../lib/contracts';

export function useEscrow() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const escrowManagerResp = useContract('escrowManager');
    const { writeContractFunc } = escrowManagerResp;

    /**
     * Create escrow - User calls this first
     */
    const createEscrow = async (
        token: string,
        amount: string, // In token decimals (e.g., "35.21" for USDT)
        paymentId: string, // From backend
        category: string
    ) => {
        const escrow = await writeContractFunc();
        if (!escrow) throw new Error('Wallet not connected');

        setLoading(true);
        setError(null);

        try {
            // Convert amount to wei (18 decimals for USDT/USDC)
            const amountWei = ethers.parseUnits(amount, 6); // USDT/USDC use 6 decimals

            // Convert paymentId to bytes32
            const paymentIdBytes = ethers.encodeBytes32String(paymentId);

            // First approve token if needed
            await approveToken(token, amountWei.toString());

            // Create escrow
            const tx = await escrow.createEscrow(
                token,
                amountWei,
                paymentIdBytes,
                category
            );

            console.log('Transaction sent:', tx.hash);

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Extract escrowId from event logs
            const escrowCreatedEvent = receipt.logs.find(
                (log: any) => log.fragment?.name === 'EscrowCreated'
            );

            const escrowId = escrowCreatedEvent?.args?.[0]; // First argument is escrowId

            setLoading(false);
            return {
                success: true,
                txHash: tx.hash,
                escrowId: escrowId,
                receipt
            };
        } catch (err: any) {
            console.error('Escrow creation failed:', err);
            setError(err.message || 'Transaction failed');
            setLoading(false);
            throw err;
        }
    };

    /**
     * Approve token spending
     */
    const approveToken = async (tokenAddress: string, amount: string) => {
        const escrow = await writeContractFunc();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const token = new ethers.Contract(tokenAddress, ABIS.erc20, signer);

        // Check current allowance
        const currentAllowance = await token.allowance(
            await signer.getAddress(),
            escrow.target
        );

        if (currentAllowance < BigInt(amount)) {
            console.log('Approving token...');
            const approveTx = await token.approve(escrow.target, amount);
            await approveTx.wait();
            console.log('Token approved');
        }
    };

    /**
     * Get escrow details
     */
    const getEscrow = async (escrowId: string) => {
        const escrow = await writeContractFunc();
        if (!escrow) throw new Error('Contract not initialized');

        try {
            const escrowData = await escrow.getEscrow(escrowId);

            return {
                user: escrowData.user,
                token: escrowData.token,
                amount: ethers.formatUnits(escrowData.amount, 6), // USDT/USDC = 6 decimals
                createdAt: new Date(Number(escrowData.createdAt) * 1000),
                timeoutAt: new Date(Number(escrowData.timeoutAt) * 1000),
                paymentId: escrowData.paymentId,
                status: ['Active', 'Released', 'Refunded', 'Expired'][escrowData.status],
                category: escrowData.category
            };
        } catch (err) {
            console.error('Failed to get escrow:', err);
            throw err;
        }
    };

    /**
     * Get user's escrows
     */
    const getUserEscrows = async (userAddress: string) => {
        const escrow = await writeContractFunc();
        if (!escrow) throw new Error('Contract not initialized');

        try {
            const escrowIds = await escrow.getUserEscrows(userAddress);

            // Fetch details for each escrow
            const escrows = await Promise.all(
                escrowIds.map((id: string) => getEscrow(id))
            );

            return escrows;
        } catch (err) {
            console.error('Failed to get user escrows:', err);
            throw err;
        }
    };

    /**
     * Check if escrow has expired (client-side check)
     */
    const isEscrowExpired = async (escrowId: string) => {
        const escrow = await writeContractFunc();
        const escrowData = await getEscrow(escrowId);
        return escrowData.timeoutAt < new Date();
    };

    return {
        createEscrow,
        getEscrow,
        getUserEscrows,
        isEscrowExpired,
        loading,
        error
    };
}
