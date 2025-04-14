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

// AI Service using Groq API
class AIService {
  async generateFinancialInsight(userFinancialData: any): Promise<AiTip> {
    // Analyze user data and generate a tip
    const categories: TipCategory[] = ['savings', 'budgeting', 'spending', 'investing', 'debt', 'goals'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // In production, we'll use the Groq API with the user's financial data
    const messages = [
      {
        role: 'system',
        content: 'You are a financial advisor. Analyze the user\'s financial data and provide one specific, actionable insight.'
      },
      {
        role: 'user',
        content: `Generate a financial insight about ${randomCategory} based on my financial data.`
      }
    ];
    
    const content = await groqService.getChatCompletion(messages);
    
    return {
      id: Date.now().toString(),
      userId: sessionStore.transactions.length > 0 ? sessionStore.transactions[0].userId : '123',
      content,
      category: randomCategory,
      createdAt: new Date(),
      isRead: false,
      relevanceScore: Math.floor(Math.random() * 100)
    };
  }
  
  async getAIResponse(message: string, chatHistory: ChatMessage[]): Promise<string> {
    // Format the messages for the Groq API
    const formattedMessages = groqService.formatChatHistory(chatHistory);
    
    // Add the user's latest message
    formattedMessages.push({
      role: 'user',
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
      
      const newTransaction = {
        user_id: user.id,
        date: transaction.date || new Date(),
        amount: transaction.amount || 0,
        category: transaction.category || 'food',
        description: transaction.description || '',
        is_income: transaction.isIncome || false,
        is_recurring: transaction.isRecurring || false,
        recurring_frequency: transaction.recurringFrequency
      };
      
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
      
      const newBudget = {
        user_id: user.id,
        category: budget.category || 'food',
        budget_limit: budget.limit || 0,
        period: budget.period || 'monthly',
        start_date: new Date(),
        is_active: true,
        current_spent: 0
      };
      
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
      
      const newGoal = {
        user_id: user.id,
        name: goal.name || 'New Goal',
        target_amount: goal.targetAmount || 0,
        current_amount: 0,
        deadline: goal.deadline,
        is_completed: false,
        category: goal.category || 'other',
        priority: goal.priority || 'medium',
        image_url: goal.imageUrl
      };
      
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
      
      // If no tips are available, generate one
      if (sessionStore.aiTips.length === 0) {
        const newTip = await aiService.generateFinancialInsight({});
        sessionStore.aiTips = [newTip];
      }
      
      return sessionStore.aiTips;
    }
  },
  
  // Chat functionality
  getChatHistory: async (): Promise<ChatMessage[]> => {
    // For now, we'll store chat history in memory
    // In a future version, we could store this in Supabase
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
      
      // Get AI response using the Groq API
      const aiResponse = await aiService.getAIResponse(content, [...currentHistory, userMessage]);
      
      // Create AI message
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      // Update chat history
      const updatedChat = [...currentHistory, userMessage, aiMessage];
      sessionStore.chatHistory = updatedChat;
      
      // Generate a new AI tip based on the conversation
      if (Math.random() > 0.7) {  // 30% chance to generate a new tip
        const newTip = await aiService.generateFinancialInsight({});
        
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
      
      return updatedChat;
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
      
      // Generate a new AI tip
      const newTip = await aiService.generateFinancialInsight({});
      
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
