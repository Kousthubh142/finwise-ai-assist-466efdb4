
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../models/user';
import { Transaction } from '../models/transaction';
import { Budget } from '../models/budget';
import { SavingsGoal } from '../models/Goal';
import { AiTip, ChatMessage } from '../models/AiTip';

// Mock data for demo purposes
const dummyUser: User = {
  id: 'user1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  monthlyIncome: 4500,
  riskTolerance: 'medium',
  financialGoals: ['Buy a house', 'Save for retirement', 'Travel to Japan'],
  createdAt: new Date('2023-01-15')
};

const dummyTransactions: Transaction[] = [
  {
    id: 't1',
    userId: 'user1',
    amount: 1200,
    date: new Date('2023-04-01'),
    description: 'Rent payment',
    category: 'housing',
    isIncome: false,
    isRecurring: true,
    recurringFrequency: 'monthly'
  },
  {
    id: 't2',
    userId: 'user1',
    amount: 85.42,
    date: new Date('2023-04-02'),
    description: 'Grocery shopping',
    category: 'food',
    isIncome: false,
    isRecurring: false
  },
  {
    id: 't3',
    userId: 'user1',
    amount: 4500,
    date: new Date('2023-04-05'),
    description: 'Salary deposit',
    category: 'income',
    isIncome: true,
    isRecurring: true,
    recurringFrequency: 'monthly'
  }
];

const dummyBudgets: Budget[] = [
  {
    id: 'b1',
    userId: 'user1',
    category: 'housing',
    limit: 1500,
    period: 'monthly',
    startDate: new Date('2023-04-01'),
    isActive: true,
    currentSpent: 1200
  },
  {
    id: 'b2',
    userId: 'user1',
    category: 'food',
    limit: 600,
    period: 'monthly',
    startDate: new Date('2023-04-01'),
    isActive: true,
    currentSpent: 320
  }
];

const dummyGoals: SavingsGoal[] = [
  {
    id: 'g1',
    userId: 'user1',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 5000,
    category: 'emergency',
    priority: 'high',
    isCompleted: false,
    createdAt: new Date('2023-02-01')
  },
  {
    id: 'g2',
    userId: 'user1',
    name: 'Japan Trip',
    targetAmount: 3500,
    currentAmount: 1200,
    deadline: new Date('2023-12-31'),
    category: 'vacation',
    priority: 'medium',
    isCompleted: false,
    createdAt: new Date('2023-01-15')
  }
];

const dummyTips: AiTip[] = [
  {
    id: 'tip1',
    userId: 'user1',
    content: 'You\'ve spent 80% of your entertainment budget this month. Consider limiting non-essential activities for the next week.',
    category: 'budgeting',
    createdAt: new Date('2023-04-20'),
    isRead: false,
    relevanceScore: 0.85
  }
];

const dummyMessages: ChatMessage[] = [
  {
    id: 'msg1',
    content: 'Hi! How can I help with your finances today?',
    sender: 'ai',
    timestamp: new Date('2023-04-21T09:00:00')
  }
];

// Simulate API services with AsyncStorage
export const api = {
  // Auth services
  login: async (email: string, password: string): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Store user in AsyncStorage for persistence
        AsyncStorage.setItem('finWiseUser', JSON.stringify(dummyUser));
        resolve(dummyUser);
      }, 800);
    });
  },
  
  register: async (userData: Partial<User>): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          ...dummyUser,
          ...userData,
          id: 'user' + Math.floor(Math.random() * 1000),
          createdAt: new Date()
        };
        AsyncStorage.setItem('finWiseUser', JSON.stringify(newUser));
        resolve(newUser);
      }, 800);
    });
  },
  
  getUserProfile: async (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyUser);
      }, 500);
    });
  },
  
  // Transaction services
  getTransactions: async (): Promise<Transaction[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...dummyTransactions]);
      }, 600);
    });
  },
  
  addTransaction: async (transaction: Partial<Transaction>): Promise<Transaction> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTransaction = {
          ...transaction,
          id: 't' + Math.floor(Math.random() * 1000),
          userId: 'user1',
          date: new Date(),
        } as Transaction;
        
        dummyTransactions.push(newTransaction);
        resolve(newTransaction);
      }, 600);
    });
  },
  
  // Budget services
  getBudgets: async (): Promise<Budget[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...dummyBudgets]);
      }, 500);
    });
  },
  
  createBudget: async (budget: Partial<Budget>): Promise<Budget> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBudget = {
          ...budget,
          id: 'b' + Math.floor(Math.random() * 1000),
          userId: 'user1',
          startDate: new Date(),
          isActive: true,
          currentSpent: 0
        } as Budget;
        
        dummyBudgets.push(newBudget);
        resolve(newBudget);
      }, 500);
    });
  },
  
  // Savings Goal services
  getSavingsGoals: async (): Promise<SavingsGoal[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...dummyGoals]);
      }, 500);
    });
  },
  
  createSavingsGoal: async (goal: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newGoal = {
          ...goal,
          id: 'g' + Math.floor(Math.random() * 1000),
          userId: 'user1',
          currentAmount: 0,
          isCompleted: false,
          createdAt: new Date()
        } as SavingsGoal;
        
        dummyGoals.push(newGoal);
        resolve(newGoal);
      }, 500);
    });
  },
  
  updateSavingsGoal: async (goalId: string, amount: number): Promise<SavingsGoal> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const goalIndex = dummyGoals.findIndex(g => g.id === goalId);
        if (goalIndex !== -1) {
          const updatedGoal = { ...dummyGoals[goalIndex] };
          updatedGoal.currentAmount += amount;
          
          if (updatedGoal.currentAmount >= updatedGoal.targetAmount) {
            updatedGoal.isCompleted = true;
          }
          
          dummyGoals[goalIndex] = updatedGoal;
          resolve(updatedGoal);
        } else {
          throw new Error('Goal not found');
        }
      }, 500);
    });
  },
  
  // AI insights services
  getAiTips: async (): Promise<AiTip[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...dummyTips]);
      }, 500);
    });
  },
  
  getChatHistory: async (): Promise<ChatMessage[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...dummyMessages]);
      }, 500);
    });
  },
  
  sendChatMessage: async (content: string): Promise<ChatMessage[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userMessage: ChatMessage = {
          id: 'msg' + Math.floor(Math.random() * 1000),
          content,
          sender: 'user',
          timestamp: new Date()
        };
        
        const aiMessage: ChatMessage = {
          id: 'msg' + Math.floor(Math.random() * 1000),
          content: 'Thank you for your message. I\'ll analyze your finances and provide insights shortly.',
          sender: 'ai',
          timestamp: new Date(Date.now() + 1000)
        };
        
        dummyMessages.push(userMessage, aiMessage);
        resolve([...dummyMessages]);
      }, 800);
    });
  }
};
