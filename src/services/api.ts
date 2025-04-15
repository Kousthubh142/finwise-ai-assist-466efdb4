import { User } from '@/models/user';
import { Transaction, TransactionCategory } from '@/models/transaction';
import { Budget } from '@/models/budget';
import { SavingsGoal } from '@/models/goal';
import { AiTip, ChatMessage, TipCategory } from '@/models/aiTip';
import { groqService } from './groq';
import { supabase } from '@/integrations/supabase/client';

// Store for current session data
const sessionStore = {
  transactions: [] as Transaction[],
  budgets: [] as Budget[],
  savingsGoals: [] as SavingsGoal[],
  aiTips: [] as AiTip[],
  chatHistory: [] as ChatMessage[]
};

// Utility function to map database transaction to app transaction
const mapTransaction = (item: any): Transaction => ({
  id: item.id,
  userId: item.user_id,
  date: new Date(item.date),
  amount: item.amount,
  category: item.category as TransactionCategory,
  description: item.description || '',
  isIncome: item.is_income || false,
  isRecurring: item.is_recurring || false,
  recurringFrequency: item.recurring_frequency as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined
});

// Utility function to map database budget to app budget
const mapBudget = (item: any): Budget => ({
  id: item.id,
  userId: item.user_id,
  category: item.category as TransactionCategory,
  limit: item.budget_limit,
  period: item.period as 'daily' | 'weekly' | 'monthly' | 'yearly',
  startDate: new Date(item.start_date),
  isActive: item.is_active || true,
  currentSpent: item.current_spent || 0,
  endDate: item.end_date ? new Date(item.end_date) : undefined
});

// Utility function to map database savings goal to app savings goal
const mapSavingsGoal = (item: any): SavingsGoal => ({
  id: item.id,
  userId: item.user_id,
  name: item.name,
  targetAmount: item.target_amount,
  currentAmount: item.current_amount || 0,
  deadline: item.deadline ? new Date(item.deadline) : undefined,
  category: item.category as 'emergency' | 'retirement' | 'education' | 'other' | 'large_purchase' | 'vacation',
  priority: item.priority as 'low' | 'medium' | 'high',
  isCompleted: item.is_completed || false,
  createdAt: new Date(item.created_at),
  imageUrl: item.image_url
});

// Utility function to map database user to app user
const mapUser = (profileData: any, userData: any): User => ({
  id: userData.id,
  name: profileData.name,
  email: userData.email || '',
  monthlyIncome: profileData.monthly_income || 0,
  riskTolerance: profileData.risk_tolerance as 'low' | 'medium' | 'high' || 'medium',
  financialGoals: profileData.financial_goals || [],
  createdAt: new Date(profileData.created_at)
});

// Utility function to map app transaction to database transaction
const mapTransactionToDb = (transaction: Partial<Transaction>, userId: string) => {
  return {
    user_id: userId,
    date: transaction.date?.toISOString() || new Date().toISOString(),
    amount: transaction.amount || 0,
    category: transaction.category || 'food',
    description: transaction.description || '',
    is_income: transaction.isIncome || false,
    is_recurring: transaction.isRecurring || false,
    recurring_frequency: transaction.recurringFrequency
  };
};

// Utility function to map app budget to database budget
const mapBudgetToDb = (budget: Partial<Budget>, userId: string) => {
  return {
    user_id: userId,
    category: budget.category || 'food',
    budget_limit: budget.limit || 0,
    period: budget.period || 'monthly',
    start_date: budget.startDate?.toISOString() || new Date().toISOString(),
    is_active: budget.isActive !== undefined ? budget.isActive : true,
    current_spent: budget.currentSpent || 0
  };
};

// Utility function to map app savings goal to database savings goal
const mapSavingsGoalToDb = (goal: Partial<SavingsGoal>, userId: string) => {
  return {
    user_id: userId,
    name: goal.name || 'New Goal',
    target_amount: goal.targetAmount || 0,
    current_amount: goal.currentAmount || 0,
    deadline: goal.deadline?.toISOString(),
    category: goal.category || 'other',
    priority: goal.priority || 'medium',
    is_completed: goal.isCompleted || false,
    image_url: goal.imageUrl
  };
};

// AI Service using Groq API
class AIService {
  async generateFinancialInsight(userFinancialData: any): Promise<AiTip> {
    // Analyze user data and generate a tip
    const categories: TipCategory[] = ['savings', 'budgeting', 'spending', 'investing', 'debt', 'goals'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Generate prompt based on user's actual financial data
    let insightPrompt = `Generate a financial insight about ${randomCategory} based on the following data:\n`;
    
    if (userFinancialData.transactions?.length > 0) {
      const totalSpent = userFinancialData.transactions
        .filter((t: any) => !t.isIncome)
        .reduce((sum: number, t: any) => sum + t.amount, 0);
      
      insightPrompt += `- Total spending: ${totalSpent}\n`;
      
      // Add category breakdown if available
      const categorySpending: Record<string, number> = {};
      userFinancialData.transactions
        .filter((t: any) => !t.isIncome)
        .forEach((t: any) => {
          categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        });
      
      for (const [category, amount] of Object.entries(categorySpending)) {
        insightPrompt += `- ${category.replace('_', ' ')} spending: ${amount}\n`;
      }
    }
    
    if (userFinancialData.budgets?.length > 0) {
      insightPrompt += `- Budget information: ${userFinancialData.budgets.length} budget categories\n`;
      userFinancialData.budgets.forEach((b: any) => {
        insightPrompt += `  - ${b.category.replace('_', ' ')} budget: limit ${b.limit}, spent ${b.currentSpent || 0}\n`;
      });
    }
    
    if (userFinancialData.savingsGoals?.length > 0) {
      insightPrompt += `- Savings goals: ${userFinancialData.savingsGoals.length} goals\n`;
      userFinancialData.savingsGoals.forEach((g: any) => {
        insightPrompt += `  - ${g.name}: target ${g.targetAmount}, current ${g.currentAmount}, deadline: ${g.deadline || 'none'}\n`;
      });
    }
    
    insightPrompt += "\nProvide one specific, actionable financial insight that is personalized, data-driven, and helpful.";
    
    // In production, we'll use the Groq API with the user's financial data
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a financial advisor. Analyze the user\'s financial data and provide one specific, actionable insight. Be concise and practical.'
      },
      {
        role: 'user' as const,
        content: insightPrompt
      }
    ];
    
    const content = await groqService.getChatCompletion(messages);
    
    return {
      id: Date.now().toString(),
      userId: userFinancialData.userId || 'user123',
      content,
      category: randomCategory,
      createdAt: new Date(),
      isRead: false,
      relevanceScore: Math.floor(Math.random() * 100)
    };
  }
  
  async getAIResponse(message: string, chatHistory: ChatMessage[], userFinancialData: any): Promise<string> {
    // Augment the system prompt with user's financial data
    let systemPrompt = 'You are a helpful financial assistant. ';
    
    if (userFinancialData) {
      systemPrompt += 'Here is the user\'s financial information:\n';
      
      if (userFinancialData.transactions?.length > 0) {
        const income = userFinancialData.transactions
          .filter((t: any) => t.isIncome)
          .reduce((sum: number, t: any) => sum + t.amount, 0);
          
        const expenses = userFinancialData.transactions
          .filter((t: any) => !t.isIncome)
          .reduce((sum: number, t: any) => sum + t.amount, 0);
          
        systemPrompt += `- Monthly income: approximately ${income}\n`;
        systemPrompt += `- Monthly expenses: approximately ${expenses}\n`;
        
        // Add top spending categories
        const categorySpending: Record<string, number> = {};
        userFinancialData.transactions
          .filter((t: any) => !t.isIncome)
          .forEach((t: any) => {
            categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
          });
        
        const topCategories = Object.entries(categorySpending)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 3);
          
        systemPrompt += "- Top spending categories:\n";
        topCategories.forEach(([category, amount]) => {
          systemPrompt += `  - ${category.replace('_', ' ')}: ${amount}\n`;
        });
      }
      
      if (userFinancialData.budgets?.length > 0) {
        systemPrompt += "- Budget information:\n";
        userFinancialData.budgets.forEach((b: any) => {
          const percentUsed = b.limit > 0 ? ((b.currentSpent || 0) / b.limit) * 100 : 0;
          systemPrompt += `  - ${b.category.replace('_', ' ')}: ${percentUsed.toFixed(0)}% of budget used (${b.currentSpent || 0} of ${b.limit})\n`;
        });
      }
      
      if (userFinancialData.savingsGoals?.length > 0) {
        systemPrompt += "- Saving goals:\n";
        userFinancialData.savingsGoals.forEach((g: any) => {
          const percentComplete = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
          systemPrompt += `  - ${g.name}: ${percentComplete.toFixed(0)}% complete (${g.currentAmount} of ${g.targetAmount})\n`;
        });
      }
    }
    
    systemPrompt += "\nProvide personalized, data-driven financial advice based on this information. Be concise, practical, and specific.";
    
    // Format the messages for the Groq API
    const formattedMessages = [{
      role: 'system' as const,
      content: systemPrompt
    }];
    
    // Add chat history
    chatHistory.forEach(msg => {
      formattedMessages.push({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      });
    });
    
    // Add the user's latest message
    formattedMessages.push({
      role: 'user' as const,
      content: message
    });
    
    // Get response from Groq
    return await groqService.getChatCompletion(formattedMessages);
  }
}

// Initialize AI service
const aiService = new AIService();

export const api = {
  // Authentication
  login: async (credentials: Pick<User, 'email' | 'password'>): Promise<User> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) throw error;
      
      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (!profileData) throw new Error('Profile not found');
      
      return mapUser(profileData, data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid credentials');
    }
  },
  
  register: async (userData: Omit<User, 'id'>): Promise<User> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || '',
        options: {
          data: {
            name: userData.name,
            monthly_income: userData.monthlyIncome,
            risk_tolerance: userData.riskTolerance,
            financial_goals: userData.financialGoals
          }
        }
      });
      
      if (error) throw error;
      
      if (!data.user) throw new Error('Registration failed');
      
      return {
        id: data.user.id,
        name: userData.name,
        email: userData.email,
        monthlyIncome: userData.monthlyIncome || 0,
        riskTolerance: userData.riskTolerance || 'medium',
        financialGoals: userData.financialGoals || [],
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      const transactions = data.map(mapTransaction);
      
      sessionStore.transactions = transactions;
      return transactions;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return sessionStore.transactions;
    }
  },
  
  addTransaction: async (transaction: Partial<Transaction>): Promise<Transaction> => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const newTransaction = mapTransactionToDb(transaction, user.id);
      
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select()
        .single();
        
      if (error) throw error;
      
      const formattedTransaction = mapTransaction(data);
      
      sessionStore.transactions = [...sessionStore.transactions, formattedTransaction];
      return formattedTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Budgets
  getBudgets: async (): Promise<Budget[]> => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*');
        
      if (error) throw error;
      
      const budgets = data.map(mapBudget);
      
      sessionStore.budgets = budgets;
      return budgets;
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return sessionStore.budgets;
    }
  },
  
  createBudget: async (budget: Partial<Budget>): Promise<Budget> => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const newBudget = mapBudgetToDb(budget, user.id);
      
      const { data, error } = await supabase
        .from('budgets')
        .insert([newBudget])
        .select()
        .single();
        
      if (error) throw error;
      
      const formattedBudget = mapBudget(data);
      
      sessionStore.budgets = [...sessionStore.budgets, formattedBudget];
      return formattedBudget;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  },

  // Savings Goals
  getSavingsGoals: async (): Promise<SavingsGoal[]> => {
    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*');
        
      if (error) throw error;
      
      const goals = data.map(mapSavingsGoal);
      
      sessionStore.savingsGoals = goals;
      return goals;
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      return sessionStore.savingsGoals;
    }
  },
  
  createSavingsGoal: async (goal: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const newGoal = mapSavingsGoalToDb(goal, user.id);
      
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([newGoal])
        .select()
        .single();
        
      if (error) throw error;
      
      const formattedGoal = mapSavingsGoal(data);
      
      sessionStore.savingsGoals = [...sessionStore.savingsGoals, formattedGoal];
      return formattedGoal;
    } catch (error) {
      console.error('Error creating savings goal:', error);
      throw error;
    }
  },
  
  updateSavingsGoal: async (goalId: string, amount: number): Promise<SavingsGoal> => {
    try {
      const { data: goal, error: fetchError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('id', goalId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const isCompleted = amount >= goal.target_amount;
      
      const { data, error } = await supabase
        .from('savings_goals')
        .update({ 
          current_amount: amount,
          is_completed: isCompleted
        })
        .eq('id', goalId)
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedGoal = mapSavingsGoal(data);
      
      sessionStore.savingsGoals = sessionStore.savingsGoals.map(g => 
        g.id === goalId ? updatedGoal : g
      );
      
      return updatedGoal;
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  },

  // AI Tips
  getAiTips: async (): Promise<AiTip[]> => {
    try {
      const { data, error } = await supabase
        .from('ai_tips')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const tips = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        content: item.content,
        category: item.category as TipCategory,
        createdAt: new Date(item.created_at),
        isRead: item.is_read || false,
        relevanceScore: item.relevance_score || 0
      }));
      
      sessionStore.aiTips = tips;
      return tips;
    } catch (error) {
      console.error('Error fetching AI tips:', error);
      
      // If no tips are available, generate one with actual user data
      if (sessionStore.aiTips.length === 0) {
        const userData = {
          userId: sessionStore.transactions.length > 0 ? sessionStore.transactions[0].userId : 'user123',
          transactions: sessionStore.transactions,
          budgets: sessionStore.budgets,
          savingsGoals: sessionStore.savingsGoals
        };
        
        const newTip = await aiService.generateFinancialInsight(userData);
        sessionStore.aiTips = [newTip];
      }
      
      return sessionStore.aiTips;
    }
  },
  
  // Chat functionality
  getChatHistory: async (): Promise<ChatMessage[]> => {
    // For now, we'll store chat history in memory
    return sessionStore.chatHistory;
  },
  
  sendChatMessage: async (content: string): Promise<ChatMessage[]> => {
    try {
      // Get current chat history
      const currentHistory = await api.getChatHistory();
      
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date()
      };
      
      // Create temporary history with the new user message
      const updatedHistory = [...currentHistory, userMessage];
      
      // Prepare user financial data for context
      const userData = {
        userId: sessionStore.transactions.length > 0 ? sessionStore.transactions[0].userId : 'user123',
        transactions: sessionStore.transactions,
        budgets: sessionStore.budgets,
        savingsGoals: sessionStore.savingsGoals
      };
      
      // Get AI response using the Groq API
      const aiResponse = await aiService.getAIResponse(content, updatedHistory, userData);
      
      // Create AI message
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      // Update chat history with both messages
      const finalUpdatedChat = [...updatedHistory, aiMessage];
      sessionStore.chatHistory = finalUpdatedChat;
      
      // Generate a new AI tip based on the conversation (30% chance)
      if (Math.random() > 0.7) {
        const newTip = await aiService.generateFinancialInsight(userData);
        
        try {
          const user = (await supabase.auth.getUser()).data.user;
          if (user) {
            await supabase.from('ai_tips').insert([{
              user_id: user.id,
              content: newTip.content,
              category: newTip.category,
              relevance_score: newTip.relevanceScore,
              is_read: false
            }]);
          }
        } catch (error) {
          console.error('Error saving AI tip:', error);
        }
        
        sessionStore.aiTips = [newTip, ...sessionStore.aiTips];
      }
      
      return finalUpdatedChat;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  // Refresh all data
  refreshData: async () => {
    try {
      await Promise.all([
        api.getTransactions(),
        api.getBudgets(),
        api.getSavingsGoals(),
        api.getAiTips(),
        api.getChatHistory()
      ]);
      
      // Generate a new AI tip with actual user data
      const userData = {
        userId: sessionStore.transactions.length > 0 ? sessionStore.transactions[0].userId : 'user123',
        transactions: sessionStore.transactions,
        budgets: sessionStore.budgets,
        savingsGoals: sessionStore.savingsGoals
      };
      
      const newTip = await aiService.generateFinancialInsight(userData);
      
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          await supabase.from('ai_tips').insert([{
            user_id: user.id,
            content: newTip.content,
            category: newTip.category,
            relevance_score: newTip.relevanceScore,
            is_read: false
          }]);
        }
      } catch (error) {
        console.error('Error saving AI tip:', error);
      }
      
      sessionStore.aiTips = [newTip, ...sessionStore.aiTips];
      return true;
    } catch (error) {
      console.error('Error refreshing data:', error);
      return false;
    }
  }
};
