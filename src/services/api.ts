import { User } from '../models/user';
import { Transaction } from '../models/transaction';
import { Budget } from '../models/budget';
import { SavingsGoal } from '../models/goal';
import { AiTip, ChatMessage } from '../models/aiTip';
import { supabase } from '@/integrations/supabase/client';

// Supabase data services
export const api = {
  // Auth services
  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) throw profileError;
    
    return {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
      monthlyIncome: profileData.monthly_income || 0,
      riskTolerance: profileData.risk_tolerance || 'medium',
      financialGoals: profileData.financial_goals || [],
      avatarUrl: profileData.avatar_url,
      createdAt: new Date(profileData.created_at)
    };
  },
  
  register: async (userData: Partial<User>): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email!,
      password: userData.password as string,
      options: {
        data: {
          name: userData.name,
        }
      }
    });
    
    if (error) throw error;
    
    // Profile creation will be handled by the database trigger
    return {
      id: data.user?.id || '',
      name: userData.name || '',
      email: userData.email || '',
      monthlyIncome: userData.monthlyIncome || 0,
      riskTolerance: userData.riskTolerance || 'medium',
      financialGoals: userData.financialGoals || [],
      createdAt: new Date()
    };
  },
  
  getUserProfile: async (): Promise<User> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not found');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      monthlyIncome: data.monthly_income || 0,
      riskTolerance: data.risk_tolerance || 'medium',
      financialGoals: data.financial_goals || [],
      avatarUrl: data.avatar_url,
      createdAt: new Date(data.created_at)
    };
  },
  
  // Transaction services
  getTransactions: async (): Promise<Transaction[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      amount: item.amount,
      date: new Date(item.date),
      description: item.description || '',
      category: item.category,
      isIncome: item.is_income,
      isRecurring: item.is_recurring,
      recurringFrequency: item.recurring_frequency
    }));
  },
  
  addTransaction: async (transaction: Partial<Transaction>): Promise<Transaction> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        amount: transaction.amount,
        date: transaction.date?.toISOString() || new Date().toISOString(),
        description: transaction.description,
        category: transaction.category,
        is_income: transaction.isIncome,
        is_recurring: transaction.isRecurring,
        recurring_frequency: transaction.recurringFrequency
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      amount: data.amount,
      date: new Date(data.date),
      description: data.description || '',
      category: data.category,
      isIncome: data.is_income,
      isRecurring: data.is_recurring,
      recurringFrequency: data.recurring_frequency
    };
  },
  
  // Budget services
  getBudgets: async (): Promise<Budget[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('budgets')
      .select('*');
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      category: item.category,
      limit: item.budget_limit,
      period: item.period,
      startDate: new Date(item.start_date),
      isActive: item.is_active,
      currentSpent: item.current_spent
    }));
  },
  
  createBudget: async (budget: Partial<Budget>): Promise<Budget> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        user_id: user.id,
        category: budget.category,
        budget_limit: budget.limit,
        period: budget.period,
        start_date: budget.startDate?.toISOString() || new Date().toISOString(),
        is_active: budget.isActive,
        current_spent: budget.currentSpent || 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      category: data.category,
      limit: data.budget_limit,
      period: data.period,
      startDate: new Date(data.start_date),
      isActive: data.is_active,
      currentSpent: data.current_spent
    };
  },
  
  // Savings Goal services
  getSavingsGoals: async (): Promise<SavingsGoal[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*');
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      targetAmount: item.target_amount,
      currentAmount: item.current_amount,
      deadline: item.deadline ? new Date(item.deadline) : undefined,
      category: item.category,
      priority: item.priority,
      isCompleted: item.is_completed,
      createdAt: new Date(item.created_at),
      imageUrl: item.image_url
    }));
  },
  
  createSavingsGoal: async (goal: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('savings_goals')
      .insert([{
        user_id: user.id,
        name: goal.name,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount || 0,
        deadline: goal.deadline?.toISOString(),
        category: goal.category,
        priority: goal.priority,
        image_url: goal.imageUrl
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      targetAmount: data.target_amount,
      currentAmount: data.current_amount,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      category: data.category,
      priority: data.priority,
      isCompleted: data.is_completed,
      createdAt: new Date(data.created_at),
      imageUrl: data.image_url
    };
  },
  
  updateSavingsGoal: async (goalId: string, amount: number): Promise<SavingsGoal> => {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', goalId)
      .single();
    
    if (error) throw error;
    
    const newAmount = data.current_amount + amount;
    const isCompleted = newAmount >= data.target_amount;
    
    const { data: updatedData, error: updateError } = await supabase
      .from('savings_goals')
      .update({
        current_amount: newAmount,
        is_completed: isCompleted
      })
      .eq('id', goalId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    return {
      id: updatedData.id,
      userId: updatedData.user_id,
      name: updatedData.name,
      targetAmount: updatedData.target_amount,
      currentAmount: updatedData.current_amount,
      deadline: updatedData.deadline ? new Date(updatedData.deadline) : undefined,
      category: updatedData.category,
      priority: updatedData.priority,
      isCompleted: updatedData.is_completed,
      createdAt: new Date(updatedData.created_at),
      imageUrl: updatedData.image_url
    };
  },
  
  // AI insights services
  getAiTips: async (): Promise<AiTip[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('ai_tips')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      content: item.content,
      category: item.category,
      isRead: item.is_read,
      relevanceScore: item.relevance_score,
      createdAt: new Date(item.created_at)
    }));
  },
  
  getChatHistory: async (): Promise<ChatMessage[]> => {
    // For chat history, we'll keep a simple implementation for now
    // In a real app, you'd store this in a Supabase table as well
    return [
      {
        id: 'msg1',
        content: 'Hi! How can I help with your finances today?',
        sender: 'ai',
        timestamp: new Date()
      }
    ];
  },
  
  sendChatMessage: async (content: string): Promise<ChatMessage[]> => {
    // Simple chat implementation
    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    // AI response (placeholder)
    const aiMessage: ChatMessage = {
      id: 'ai-' + Date.now(),
      content: 'I understand you want to know more about your finances. How else can I assist you today?',
      sender: 'ai',
      timestamp: new Date()
    };
    
    return [userMessage, aiMessage];
  }
};
