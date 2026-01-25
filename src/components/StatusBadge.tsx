import { cn } from '@/lib/utils';
import { PaymentStatus, STATUS_CONFIG } from '@/types/merchant';

interface StatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  const variantStyles = {
    success: 'bg-success/15 text-success border-success/30',
    warning: 'bg-warning/15 text-warning border-warning/30',
    destructive: 'bg-destructive/15 text-destructive border-destructive/30',
    secondary: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        variantStyles[config.variant],
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        config.variant === 'success' && 'bg-success',
        config.variant === 'warning' && 'bg-warning animate-pulse',
        config.variant === 'destructive' && 'bg-destructive',
        config.variant === 'secondary' && 'bg-muted-foreground',
      )} />
      {config.label}
    </span>
  );
}
