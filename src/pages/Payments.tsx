import { useState, useMemo } from 'react';
import { PaymentTable } from '@/components/PaymentTable';
import { StatusBadge } from '@/components/StatusBadge';
import { ChainBadge } from '@/components/ChainBadge';
import { filterPayments } from '@/lib/mock-data';
import { PaymentStatus, ChainType, STATUS_CONFIG, CHAIN_CONFIG } from '@/types/merchant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Payments() {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [chainFilter, setChainFilter] = useState<ChainType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { payments, total } = useMemo(() => {
    return filterPayments({
      status: statusFilter === 'all' ? undefined : statusFilter,
      chain: chainFilter === 'all' ? undefined : chainFilter,
      search: searchQuery || undefined,
      limit: 100,
    });
  }, [statusFilter, chainFilter, searchQuery]);

  const handleExport = () => {
    const csv = [
      ['Reference', 'Amount', 'Status', 'Chain', 'Customer', 'Date'].join(','),
      ...payments.map(p => [
        p.reference,
        p.amount,
        p.status,
        p.chain || '',
        p.customerEmail || '',
        new Date(p.createdAt).toLocaleDateString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Payments exported successfully');
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setChainFilter('all');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all' || chainFilter !== 'all' || searchQuery;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your payment transactions
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by reference or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PaymentStatus | 'all')}>
          <SelectTrigger className="w-[160px] bg-muted/50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.keys(STATUS_CONFIG) as PaymentStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                <div className="flex items-center gap-2">
                  {STATUS_CONFIG[status].label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={chainFilter} onValueChange={(v) => setChainFilter(v as ChainType | 'all')}>
          <SelectTrigger className="w-[160px] bg-muted/50">
            <SelectValue placeholder="Chain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chains</SelectItem>
            {(Object.keys(CHAIN_CONFIG) as ChainType[]).map((chain) => (
              <SelectItem key={chain} value={chain}>
                <span className="uppercase">{chain}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} className="text-muted-foreground">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Results info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span>Showing {payments.length} of {total} payments</span>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-primary hover:underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {payments.length > 0 ? (
        <PaymentTable payments={payments} />
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No payments found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
