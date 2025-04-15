
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, TransactionCategory } from '../models/transaction';
import { Budget, BudgetSummary } from '../models/budget';
import { SavingsGoal } from '../models/goal';
import { AiTip, ChatMessage } from '../models/aiTip';
import { api } from '../services/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';

type FinanceContextType = {
  transactions: Transaction[];
  budgets: Budget[];
  budgetSummary: BudgetSummary | null;
  savingsGoals: SavingsGoal[];
  aiTips: AiTip[];
  chatHistory: ChatMessage[];
  isLoading: boolean;
  addTransaction: (transaction: Partial<Transaction>) => Promise<void>;
  createBudget: (budget: Partial<Budget>) => Promise<void>;
  createSavingsGoal: (goal: Partial<SavingsGoal>) => Promise<void>;
  updateSavingsGoal: (goalId: string, amount: number) => Promise<void>;
  sendChatMessage: (content: string) => Promise<void>;
  refreshData: () => Promise<void>;
  getCategoryTotal: (category: TransactionCategory) => number;
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [aiTips, setAiTips] = useState<AiTip[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Function to calculate budget summary
  const calculateBudgetSummary = (budgets: Budget[], transactions: Transaction[]): BudgetSummary => {
    // Calculate actual spent for each category based on transactions
    const updatedBudgets = budgets.map(budget => {
      const categoryTransactions = transactions.filter(
        t => t.category === budget.category && !t.isIncome
      );
      const categorySpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...budget,
        currentSpent: categorySpent // Update with actual spent amount
      };
    });
    
    const totalBudget = updatedBudgets.reduce((sum, budget) => sum + budget.limit, 0);
    const totalSpent = updatedBudgets.reduce((sum, budget) => sum + budget.currentSpent, 0);
    const remaining = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const categories = updatedBudgets.map(budget => ({
      category: budget.category,
      limit: budget.limit,
      spent: budget.currentSpent,
      remaining: budget.limit - budget.currentSpent,
      percentUsed: budget.limit > 0 ? (budget.currentSpent / budget.limit) * 100 : 0
    }));

    return {
      totalBudget,
      totalSpent,
      remaining,
      percentUsed,
      categories
    };
  };

  // Load all finance data
  const loadData = async () => {
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [transactionData, budgetData, goalData, tipData, chatData] = await Promise.all([
        api.getTransactions(),
        api.getBudgets(),
        api.getSavingsGoals(),
        api.getAiTips(),
        api.getChatHistory()
      ]);

      setTransactions(transactionData);
      setBudgets(budgetData);
      setSavingsGoals(goalData);
      setAiTips(tipData);
      setChatHistory(chatData);
      
      // Calculate budget summary based on transactions and budgets
      setBudgetSummary(calculateBudgetSummary(budgetData, transactionData));
    } catch (error) {
      console.error('Error loading finance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load and refresh on auth changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    } else {
      // Clear data when logged out
      setTransactions([]);
      setBudgets([]);
      setBudgetSummary(null);
      setSavingsGoals([]);
      setAiTips([]);
      setChatHistory([]);
    }
  }, [isAuthenticated, user]);

  // Add a new transaction
  const addTransaction = async (transaction: Partial<Transaction>) => {
    try {
      const newTransaction = await api.addTransaction(transaction);
      
      // Update transactions state
      const updatedTransactions = [...transactions, newTransaction];
      setTransactions(updatedTransactions);
      
      // Recalculate budget summary with updated transactions
      const updatedSummary = calculateBudgetSummary(budgets, updatedTransactions);
      setBudgetSummary(updatedSummary);
      
      toast({
        title: 'Success',
        description: 'Transaction added successfully'
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive'
      });
    }
  };

  // Create a new budget
  const createBudget = async (budget: Partial<Budget>) => {
    try {
      const newBudget = await api.createBudget(budget);
      
      // Update budgets state
      const updatedBudgets = [...budgets, newBudget];
      setBudgets(updatedBudgets);
      
      // Recalculate budget summary with new budget
      setBudgetSummary(calculateBudgetSummary(updatedBudgets, transactions));
      
      toast({
        title: 'Success',
        description: 'Budget created successfully'
      });
    } catch (error) {
      console.error('Error creating budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to create budget',
        variant: 'destructive'
      });
    }
  };

  // Create a new savings goal
  const createSavingsGoal = async (goal: Partial<SavingsGoal>) => {
    try {
      const newGoal = await api.createSavingsGoal(goal);
      setSavingsGoals(prev => [...prev, newGoal]);
      toast({
        title: 'Success',
        description: 'Savings goal created successfully'
      });
    } catch (error) {
      console.error('Error creating savings goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to create savings goal',
        variant: 'destructive'
      });
    }
  };

  // Update a savings goal
  const updateSavingsGoal = async (goalId: string, amount: number) => {
    try {
      const updatedGoal = await api.updateSavingsGoal(goalId, amount);
      setSavingsGoals(prev => prev.map(goal => goal.id === goalId ? updatedGoal : goal));
      
      if (updatedGoal.isCompleted) {
        toast({
          title: 'Congratulations!',
          description: `You've completed your "${updatedGoal.name}" goal!`
        });
      } else {
        toast({
          title: 'Success',
          description: `Savings goal updated successfully`
        });
      }
    } catch (error) {
      console.error('Error updating savings goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to update savings goal',
        variant: 'destructive'
      });
    }
  };

  // Send a chat message and get AI response
  const sendChatMessage = async (content: string) => {
    try {
      // First, add the user message to the chat history
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content,
        sender: 'user',
        timestamp: new Date()
      };
      
      const updatedChat = [...chatHistory, userMessage];
      setChatHistory(updatedChat);
      
      // Call AI service to get response
      const aiResponse = await api.sendChatMessage(content);
      
      // Update chat history with AI response
      setChatHistory(aiResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  // Get total spent for a category
  const getCategoryTotal = (category: TransactionCategory): number => {
    return transactions
      .filter(t => t.category === category && !t.isIncome)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Refresh all data
  const refreshData = async () => {
    await loadData();
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets,
        budgetSummary,
        savingsGoals,
        aiTips,
        chatHistory,
        isLoading,
        addTransaction,
        createBudget,
        createSavingsGoal,
        updateSavingsGoal,
        sendChatMessage,
        refreshData,
        getCategoryTotal
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
