
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { TransactionCategory } from '@/models/transaction';
import { getCategoryIcon } from '@/lib/utils';

type BudgetProgressBarProps = {
  category: TransactionCategory;
  spent: number;
  limit: number;
  compact?: boolean;
};

export function BudgetProgressBar({ category, spent, limit, compact = false }: BudgetProgressBarProps) {
  const percentUsed = Math.min((spent / limit) * 100, 100);
  const Icon = getCategoryIcon(category);
  
  // Determine color based on percentage
  const getProgressColor = () => {
    if (percentUsed > 90) return "bg-destructive";
    if (percentUsed > 75) return "bg-accent";
    return "bg-primary";
  };

  return (
    <div className={cn("w-full", compact ? "mb-2" : "mb-4")}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className={cn(
            "font-medium capitalize", 
            compact ? "text-sm" : "text-base"
          )}>
            {category.replace('_', ' ')}
          </span>
        </div>
        <div className={cn(
          "text-right", 
          percentUsed > 90 ? "text-destructive" : "text-muted-foreground",
          compact ? "text-xs" : "text-sm"
        )}>
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </div>
      </div>
      <Progress 
        value={percentUsed} 
        className={cn("h-2", compact ? "mb-1" : "mb-2")}
        indicatorClassName={getProgressColor()}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{percentUsed.toFixed(0)}% used</span>
        <span>{formatCurrency(limit - spent)} remaining</span>
      </div>
    </div>
  );
}
