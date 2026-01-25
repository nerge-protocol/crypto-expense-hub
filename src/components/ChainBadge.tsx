import { cn } from '@/lib/utils';
import { ChainType, CHAIN_CONFIG } from '@/types/merchant';

interface ChainBadgeProps {
  chain: ChainType;
  className?: string;
}

export function ChainBadge({ chain, className }: ChainBadgeProps) {
  const config = CHAIN_CONFIG[chain];
  
  const chainStyles: Record<ChainType, string> = {
    tron: 'bg-red-500/15 text-red-400 border-red-500/30',
    base: 'bg-primary/15 text-primary border-primary/30',
    arbitrum: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    solana: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border uppercase tracking-wide',
        chainStyles[chain],
        className
      )}
    >
      {chain}
    </span>
  );
}
