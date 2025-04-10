
import { Transaction } from '@/models/transaction';
import { formatDate, formatCurrency, getCategoryIcon } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type TransactionCardProps = {
  transaction: Transaction;
  compact?: boolean;
};

export function TransactionCard({ transaction, compact = false }: TransactionCardProps) {
  const { description, amount, date, category, isIncome } = transaction;
  const Icon = getCategoryIcon(category);

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/10 transition-colors",
      compact ? "mb-2" : "mb-4"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isIncome ? "bg-secondary/20" : "bg-primary/20"
        )}>
          {isIncome ? (
            <ArrowDownLeft className="h-5 w-5 text-secondary" />
          ) : (
            <Icon className="h-5 w-5 text-primary" />
          )}
        </div>
        <div>
          <p className={cn("font-medium", compact ? "text-sm" : "text-base")}>{description}</p>
          <p className="text-xs text-muted-foreground">{formatDate(date)}</p>
        </div>
      </div>
      <div className={cn(
        "font-semibold",
        isIncome ? "text-secondary" : "text-foreground",
        compact ? "text-sm" : "text-base"
      )}>
        {isIncome ? '+' : '-'}{formatCurrency(amount)}
      </div>
    </div>
  );
}
