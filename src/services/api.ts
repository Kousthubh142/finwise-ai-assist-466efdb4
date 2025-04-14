
import { User } from '@/models/user';
import { Transaction, TransactionCategory } from '@/models/transaction';
import { Budget } from '@/models/budget';
import { SavingsGoal } from '@/models/goal';
import { AiTip, ChatMessage, TipCategory } from '@/models/aiTip';

// Mock data (replace with actual API calls later)
let mockTransactions: Transaction[] = [
  { id: '1', userId: '123', date: new Date(), amount: 50, category: 'food', description: 'Lunch', isIncome: false, isRecurring: false },
  { id: '2', userId: '123', date: new Date(), amount: 100, category: 'shopping', description: 'Clothes', isIncome: false, isRecurring: false },
  { id: '3', userId: '123', date: new Date(), amount: 2000, category: 'housing', description: 'Rent', isIncome: false, isRecurring: false },
  { id: '4', userId: '123', date: new Date(), amount: 3000, category: 'income', description: 'Salary', isIncome: true, isRecurring: false },
];

let mockBudgets: Budget[] = [
  { id: '1', userId: '123', category: 'food', limit: 300, period: 'monthly', startDate: new Date(), isActive: true, currentSpent: 150 },
  { id: '2', userId: '123', category: 'housing', limit: 2000, period: 'monthly', startDate: new Date(), isActive: true, currentSpent: 2000 },
];

let mockSavingsGoals: SavingsGoal[] = [
  { id: '1', userId: '123', name: 'New Car', targetAmount: 20000, currentAmount: 5000, deadline: new Date(), isCompleted: false, category: 'large_purchase', priority: 'medium', createdAt: new Date() },
];

let mockAiTips: AiTip[] = [
  { id: '1', userId: '123', content: 'Consider setting up automatic transfers to your savings account each month.', category: 'savings', createdAt: new Date(), isRead: false, relevanceScore: 80 },
];

let mockChatHistory: ChatMessage[] = [
  { id: '1', content: 'How can I improve my budget?', sender: 'user', timestamp: new Date() },
  { id: '2', content: 'Try to identify areas where you can cut back on spending, such as dining out or entertainment.', sender: 'ai', timestamp: new Date() },
];

// AI Service with Groq API
class AIService {
  private async callGroqAPI(prompt: string): Promise<string> {
    try {
      // This is a placeholder - we'll replace this with the actual API key in production
      // For now, we'll return a simulated response
      console.log('Calling Groq API with prompt:', prompt);
      return `Based on your financial data, I recommend: ${prompt}`;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      throw new Error('Failed to get AI response');
    }
  }
  
  async generateFinancialInsight(userFinancialData: any): Promise<AiTip> {
    // Analyze user data and generate a tip
    const categories: TipCategory[] = ['savings', 'budgeting', 'spending', 'investing', 'debt', 'goals'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // In production, we'll send the financial data to the Groq API
    const prompt = `Generate a financial insight about ${randomCategory} based on user data.`;
    const content = await this.callGroqAPI(prompt);
    
    return {
      id: Date.now().toString(),
      userId: '123',
      content,
      category: randomCategory,
      createdAt: new Date(),
      isRead: false,
      relevanceScore: Math.floor(Math.random() * 100)
    };
  }
  
  async getAIResponse(message: string, chatHistory: ChatMessage[]): Promise<string> {
    // Format chat history for the AI
    const formattedHistory = chatHistory
      .map(msg => `${msg.sender}: ${msg.content}`)
      .join('\n');
    
    // Create prompt for the financial advisor
    const prompt = `You are a helpful financial assistant. The user has the following chat history:\n${formattedHistory}\n\nUser's latest message: ${message}\n\nProvide financial advice:`;
    
    // In production, we'll call the Groq API with the llama-3.3-70b-versatile model
    return await this.callGroqAPI(prompt);
  }
}

// Initialize AI service
const aiService = new AIService();

export const api = {
  // Authentication
  login: async (credentials: Pick<User, 'email' | 'password'>): Promise<User> => {
    // Mock login
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      return { 
        id: '123', 
        name: 'Test User', 
        email: 'test@example.com',
        monthlyIncome: 4500,
        riskTolerance: 'medium',
        financialGoals: ['emergency', 'retirement'],
        createdAt: new Date()
      };
    }
    throw new Error('Invalid credentials');
  },
  
  register: async (userData: Omit<User, 'id'>): Promise<User> => {
    // Mock register
    return { 
      id: '123', 
      name: userData.name, 
      email: userData.email,
      monthlyIncome: userData.monthlyIncome || 0,
      riskTolerance: userData.riskTolerance || 'medium',
      financialGoals: userData.financialGoals || [],
      createdAt: new Date()
    };
  },

  // Transactions
  getTransactions: async (): Promise<Transaction[]> => {
    // In a real app, we'd fetch from API/database
    return mockTransactions;
  },
  
  addTransaction: async (transaction: Partial<Transaction>): Promise<Transaction> => {
    // Mock add transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      userId: '123',
      date: new Date(),
      amount: transaction.amount || 0,
      category: transaction.category || 'food',
      description: transaction.description || '',
      isIncome: transaction.isIncome || false,
      isRecurring: transaction.isRecurring || false,
      recurringFrequency: transaction.recurringFrequency,
    };
    mockTransactions.push(newTransaction);
    return newTransaction;
  },

  // Budgets
  getBudgets: async (): Promise<Budget[]> => {
    // In a real app, we'd fetch from API/database
    return mockBudgets;
  },
  
  createBudget: async (budget: Partial<Budget>): Promise<Budget> => {
    // Mock create budget
    const newBudget: Budget = {
      id: Date.now().toString(),
      userId: '123',
      category: budget.category || 'food',
      limit: budget.limit || 0,
      period: budget.period || 'monthly',
      startDate: new Date(),
      isActive: true,
      currentSpent: 0,
    };
    mockBudgets.push(newBudget);
    return newBudget;
  },

  // Savings Goals
  getSavingsGoals: async (): Promise<SavingsGoal[]> => {
    // In a real app, we'd fetch from API/database
    return mockSavingsGoals;
  },
  
  createSavingsGoal: async (goal: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    // Mock create savings goal
    const newSavingsGoal: SavingsGoal = {
      id: Date.now().toString(),
      userId: '123',
      name: goal.name || 'New Goal',
      targetAmount: goal.targetAmount || 0,
      currentAmount: 0,
      deadline: goal.deadline || new Date(),
      isCompleted: false,
      category: goal.category || 'other',
      priority: goal.priority || 'medium',
      createdAt: new Date(),
      imageUrl: goal.imageUrl
    };
    mockSavingsGoals.push(newSavingsGoal);
    return newSavingsGoal;
  },
  
  updateSavingsGoal: async (goalId: string, amount: number): Promise<SavingsGoal> => {
    const goalIndex = mockSavingsGoals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }
    
    mockSavingsGoals[goalIndex] = {
      ...mockSavingsGoals[goalIndex],
      currentAmount: amount,
      isCompleted: amount >= mockSavingsGoals[goalIndex].targetAmount,
    };
    
    return mockSavingsGoals[goalIndex];
  },

  // AI Tips
  getAiTips: async (): Promise<AiTip[]> => {
    // In a real app, we'd fetch from API/database
    return mockAiTips;
  },
  
  // Chat functionality
  getChatHistory: async (): Promise<ChatMessage[]> => {
    // In a real app, we'd fetch from API/database
    return mockChatHistory;
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
      
      // Get AI response
      const aiResponse = await aiService.getAIResponse(content, [...currentHistory, userMessage]);
      
      // Create AI message
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      // Update mock chat history
      const updatedChat = [...currentHistory, userMessage, aiMessage];
      mockChatHistory = updatedChat;
      
      // Generate a new AI tip based on the conversation
      if (Math.random() > 0.7) {  // 30% chance to generate a new tip
        const newTip = await aiService.generateFinancialInsight({});
        mockAiTips = [newTip, ...mockAiTips];
      }
      
      return updatedChat;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  // Refresh all data - in a real app, this would refetch from backend
  refreshData: async () => {
    // Generate a new AI tip
    const newTip = await aiService.generateFinancialInsight({});
    mockAiTips = [newTip, ...mockAiTips];
    return true;
  }
};
