
import { TransactionCategory } from './Transaction';

export interface Budget {
  id: string;
  userId: string;
  category: TransactionCategory;
  limit: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  currentSpent: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  categories: {
    category: TransactionCategory;
    limit: number;
    spent: number;
    remaining: number;
    percentUsed: number;
  }[];
}
