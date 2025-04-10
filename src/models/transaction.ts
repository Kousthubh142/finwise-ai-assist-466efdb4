
export type TransactionCategory = 
  | 'food' 
  | 'housing' 
  | 'transportation' 
  | 'utilities' 
  | 'healthcare' 
  | 'entertainment' 
  | 'shopping' 
  | 'education' 
  | 'personal' 
  | 'income' 
  | 'savings' 
  | 'other';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  description: string;
  category: TransactionCategory;
  isIncome: boolean;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}
