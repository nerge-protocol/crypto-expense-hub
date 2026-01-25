import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from '@/components/StatsCard';
import { PaymentTable } from '@/components/PaymentTable';
import { RevenueChart } from '@/components/RevenueChart';
import { mockPayments, getAnalytics } from '@/lib/mock-data';
import { DollarSign, ArrowUpRight, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `₦${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `₦${(amount / 1000).toFixed(0)}K`;
  }
  return `₦${amount.toLocaleString()}`;
}

export default function Dashboard() {
  const { merchantData } = useAuth();
  const navigate = useNavigate();
  const analytics = getAnalytics();
  const recentPayments = mockPayments.slice(0, 8);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="gradient-primary-text">{merchantData?.businessName || 'Merchant'}</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your payments today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          subtitle="All time earnings"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Total Payments"
          value={analytics.totalPayments.toString()}
          subtitle="Transactions processed"
          icon={ArrowUpRight}
        />
        <StatsCard
          title="Success Rate"
          value={`${analytics.successRate}%`}
          subtitle="Payment completion"
          icon={TrendingUp}
          trend={{ value: 3.2, isPositive: true }}
        />
        <StatsCard
          title="Pending"
          value={formatCurrency(analytics.pendingAmount)}
          subtitle="Awaiting payment"
          icon={Clock}
        />
      </div>

      {/* Chart */}
      <RevenueChart data={analytics.chartData} />

      {/* Recent Payments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recent Payments</h2>
            <p className="text-sm text-muted-foreground">Latest transactions from your customers</p>
          </div>
        </div>
        
        <PaymentTable 
          payments={recentPayments} 
          showViewAll 
          onViewAll={() => navigate('/payments')}
        />
      </div>
    </div>
  );
}
