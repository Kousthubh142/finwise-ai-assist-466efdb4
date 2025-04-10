
import { User } from '../models/user';
import { Transaction } from '../models/transaction';
import { Budget } from '../models/budget';
import { SavingsGoal } from '../models/goal';
import { AiTip, ChatMessage } from '../models/aiTip';

// For demo purposes, we'll use dummy data
// In a real app, these would be API calls to your backend

// Create dummy data
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
  },
  {
    id: 't4',
    userId: 'user1',
    amount: 125,
    date: new Date('2023-04-07'),
    description: 'Electricity bill',
    category: 'utilities',
    isIncome: false,
    isRecurring: true,
    recurringFrequency: 'monthly'
  },
  {
    id: 't5',
    userId: 'user1',
    amount: 65.99,
    date: new Date('2023-04-08'),
    description: 'Movie and dinner',
    category: 'entertainment',
    isIncome: false,
    isRecurring: false
  },
  {
    id: 't6',
    userId: 'user1',
    amount: 35.50,
    date: new Date('2023-04-10'),
    description: 'Gas station',
    category: 'transportation',
    isIncome: false,
    isRecurring: false
  },
  {
    id: 't7',
    userId: 'user1',
    amount: 60,
    date: new Date('2023-04-12'),
    description: 'Internet subscription',
    category: 'utilities',
    isIncome: false,
    isRecurring: true,
    recurringFrequency: 'monthly'
  },
  {
    id: 't8',
    userId: 'user1',
    amount: 129.99,
    date: new Date('2023-04-15'),
    description: 'New shoes',
    category: 'shopping',
    isIncome: false,
    isRecurring: false
  },
  {
    id: 't9',
    userId: 'user1',
    amount: 500,
    date: new Date('2023-04-15'),
    description: 'Investment deposit',
    category: 'savings',
    isIncome: false,
    isRecurring: true,
    recurringFrequency: 'monthly'
  },
  {
    id: 't10',
    userId: 'user1',
    amount: 45.30,
    date: new Date('2023-04-18'),
    description: 'Pharmacy',
    category: 'healthcare',
    isIncome: false,
    isRecurring: false
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
  },
  {
    id: 'b3',
    userId: 'user1',
    category: 'entertainment',
    limit: 250,
    period: 'monthly',
    startDate: new Date('2023-04-01'),
    isActive: true,
    currentSpent: 180
  },
  {
    id: 'b4',
    userId: 'user1',
    category: 'transportation',
    limit: 200,
    period: 'monthly',
    startDate: new Date('2023-04-01'),
    isActive: true,
    currentSpent: 120
  },
  {
    id: 'b5',
    userId: 'user1',
    category: 'utilities',
    limit: 300,
    period: 'monthly',
    startDate: new Date('2023-04-01'),
    isActive: true,
    currentSpent: 185
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
    createdAt: new Date('2023-02-01'),
    imageUrl: '/placeholder.svg'
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
    createdAt: new Date('2023-01-15'),
    imageUrl: '/placeholder.svg'
  },
  {
    id: 'g3',
    userId: 'user1',
    name: 'New Laptop',
    targetAmount: 1500,
    currentAmount: 800,
    deadline: new Date('2023-08-31'),
    category: 'large_purchase',
    priority: 'low',
    isCompleted: false,
    createdAt: new Date('2023-03-10'),
    imageUrl: '/placeholder.svg'
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
  },
  {
    id: 'tip2',
    userId: 'user1',
    content: 'Based on your spending habits, you could save an additional $200 monthly by reducing food delivery services.',
    category: 'savings',
    createdAt: new Date('2023-04-18'),
    isRead: true,
    relevanceScore: 0.75
  },
  {
    id: 'tip3',
    userId: 'user1',
    content: 'Your emergency fund is 50% complete! Keep up the good work. At this pace, you\'ll reach your goal by November.',
    category: 'goals',
    createdAt: new Date('2023-04-15'),
    isRead: true,
    relevanceScore: 0.9
  }
];

const dummyMessages: ChatMessage[] = [
  {
    id: 'msg1',
    content: 'Hi! How can I help with your finances today?',
    sender: 'ai',
    timestamp: new Date('2023-04-21T09:00:00')
  },
  {
    id: 'msg2',
    content: 'I want to know how I can save more money for my vacation goal',
    sender: 'user',
    timestamp: new Date('2023-04-21T09:01:00')
  },
  {
    id: 'msg3',
    content: 'Based on your spending habits, I see that you could save an additional $150 per month by reducing your entertainment expenses. Would you like me to suggest some specific strategies?',
    sender: 'ai',
    timestamp: new Date('2023-04-21T09:01:30')
  }
];

// Simulate API services
export const api = {
  // Auth services
  login: async (email: string, password: string): Promise<User> => {
    // In a real app, this would validate credentials with a server
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyUser);
      }, 800);
    });
  },
  
  register: async (userData: Partial<User>): Promise<User> => {
    // In a real app, this would create a new user on the server
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...dummyUser,
          ...userData,
          id: 'user' + Math.floor(Math.random() * 1000),
          createdAt: new Date()
        });
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
      }, 600);
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
          createdAt: new Date(),
          isCompleted: false,
          currentAmount: 0
        } as SavingsGoal;
        
        dummyGoals.push(newGoal);
        resolve(newGoal);
      }, 600);
    });
  },
  
  updateSavingsGoal: async (goalId: string, amount: number): Promise<SavingsGoal> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const goalIndex = dummyGoals.findIndex(g => g.id === goalId);
        if (goalIndex !== -1) {
          dummyGoals[goalIndex].currentAmount += amount;
          if (dummyGoals[goalIndex].currentAmount >= dummyGoals[goalIndex].targetAmount) {
            dummyGoals[goalIndex].isCompleted = true;
          }
          resolve(dummyGoals[goalIndex]);
        } else {
          throw new Error('Goal not found');
        }
      }, 600);
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
          id: 'msg' + (dummyMessages.length + 1),
          content,
          sender: 'user',
          timestamp: new Date()
        };
        
        dummyMessages.push(userMessage);
        
        // Simulate AI response
        setTimeout(() => {
          const aiResponses = [
            "That's a great goal! Based on your current spending, you could save $200 more each month by reducing restaurant expenses.",
            "Looking at your budget, I recommend setting aside 15% of your income for this goal. Would you like me to adjust your budget automatically?",
            "I've analyzed your spending patterns and notice you might be overpaying for subscriptions. Want me to show you which ones you use least?",
            "Based on your income and expenses, you're on track to reach your emergency fund goal in about 6 months. Keep it up!",
            "I notice you've been spending more on transportation lately. Have you considered carpooling or public transit to reduce these costs?"
          ];
          
          const aiMessage: ChatMessage = {
            id: 'msg' + (dummyMessages.length + 1),
            content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
            sender: 'ai',
            timestamp: new Date()
          };
          
          dummyMessages.push(aiMessage);
          resolve([...dummyMessages]);
        }, 1000);
      }, 600);
    });
  }
};
