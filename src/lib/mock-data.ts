import { MerchantPayment, MerchantSettlement, AnalyticsResponse, ChainType, PaymentStatus } from '@/types/merchant';

// Mock data for demo purposes (no backend connected)

const chains: ChainType[] = ['tron', 'base', 'arbitrum', 'solana'];
const statuses: PaymentStatus[] = ['pending', 'processing', 'success', 'failed', 'cancelled'];

function randomDate(daysBack: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date.toISOString();
}

function generateReference(): string {
  return `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function generateHash(): string {
  return `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
}

export const mockPayments: MerchantPayment[] = Array.from({ length: 50 }, (_, i) => {
  const status = i < 5 ? 'pending' : statuses[Math.floor(Math.random() * statuses.length)];
  const amount = Math.floor(Math.random() * 500000) + 5000;
  const chain = chains[Math.floor(Math.random() * chains.length)];
  const createdAt = randomDate(30);
  
  return {
    id: `payment-${i + 1}`,
    reference: generateReference(),
    amount,
    currency: 'NGN',
    customerEmail: `customer${i + 1}@example.com`,
    metadata: { orderId: `ORD-${1000 + i}` },
    status,
    chain: status !== 'pending' ? chain : undefined,
    cryptoAmount: status !== 'pending' ? (amount / 1420).toFixed(2) : undefined,
    txHash: status === 'success' ? generateHash() : undefined,
    paidAt: ['success', 'processing'].includes(status) ? createdAt : undefined,
    settledAt: status === 'success' ? createdAt : undefined,
    createdAt,
    updatedAt: createdAt,
  };
}).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const mockSettlements: MerchantSettlement[] = Array.from({ length: 15 }, (_, i) => {
  const amount = Math.floor(Math.random() * 2000000) + 100000;
  const createdAt = randomDate(60);
  const status: MerchantSettlement['status'] = i < 2 ? 'pending' : 'completed';
  
  return {
    id: `settlement-${i + 1}`,
    amount: Math.floor(amount * 0.985), // After 1.5% fee
    paymentsCount: Math.floor(Math.random() * 20) + 5,
    paymentIds: [],
    status,
    transferReference: status === 'completed' ? `FLW-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : undefined,
    settledAt: status === 'completed' ? createdAt : undefined,
    createdAt,
    updatedAt: createdAt,
  };
}).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export function getAnalytics(): AnalyticsResponse {
  const successfulPayments = mockPayments.filter(p => p.status === 'success');
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = mockPayments.filter(p => p.status === 'pending');
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  
  // Generate chart data for last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayPayments = successfulPayments.filter(p => 
      p.createdAt.startsWith(dateStr)
    );
    
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      amount: dayPayments.reduce((sum, p) => sum + p.amount, 0),
      count: dayPayments.length,
    };
  });

  return {
    totalRevenue,
    totalPayments: mockPayments.length,
    successRate: Math.round((successfulPayments.length / mockPayments.length) * 100),
    pendingAmount,
    chartData,
  };
}

export function filterPayments(filters: {
  status?: PaymentStatus;
  chain?: ChainType;
  search?: string;
  limit?: number;
}): { payments: MerchantPayment[]; total: number } {
  let filtered = [...mockPayments];
  
  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status);
  }
  
  if (filters.chain) {
    filtered = filtered.filter(p => p.chain === filters.chain);
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.reference.toLowerCase().includes(search) ||
      p.customerEmail?.toLowerCase().includes(search)
    );
  }
  
  const total = filtered.length;
  const payments = filtered.slice(0, filters.limit || 50);
  
  return { payments, total };
}
