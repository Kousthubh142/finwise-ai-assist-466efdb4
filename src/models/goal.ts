
export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  category: 'emergency' | 'retirement' | 'large_purchase' | 'vacation' | 'education' | 'other';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdAt: Date;
  imageUrl?: string;
}
