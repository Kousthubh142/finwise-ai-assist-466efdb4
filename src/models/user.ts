
export interface User {
  id: string;
  name: string;
  email: string;
  monthlyIncome: number;
  riskTolerance: 'low' | 'medium' | 'high';
  financialGoals: string[];
  avatarUrl?: string;
  createdAt: Date;
  password?: string; // Used only during registration
  needsOnboarding?: boolean; // New flag to indicate if user needs onboarding
}
