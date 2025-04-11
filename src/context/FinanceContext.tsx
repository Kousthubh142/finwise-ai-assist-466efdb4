
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, TransactionCategory } from '../models/transaction';
import { Budget, BudgetSummary } from '../models/budget';
import { SavingsGoal } from '../models/Goal';
import { AiTip, ChatMessage } from '../models/AiTip';
import { api } from '../services/api';
import { useToast } from '@/components/ui/use-toast';

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

  // Function to calculate budget summary
  const calculateBudgetSummary = (budgets: Budget[]): BudgetSummary => {
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.currentSpent, 0);
    const remaining = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const categories = budgets.map(budget => ({
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
      
      // Calculate budget summary
      setBudgetSummary(calculateBudgetSummary(budgetData));
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

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  // Add a new transaction
  const addTransaction = async (transaction: Partial<Transaction>) => {
    try {
      const newTransaction = await api.addTransaction(transaction);
      setTransactions(prev => [...prev, newTransaction]);
      
      // Update budget for the category
      const relevantBudgetIndex = budgets.findIndex(b => b.category === newTransaction.category);
      if (relevantBudgetIndex !== -1 && !newTransaction.isIncome) {
        const updatedBudgets = [...budgets];
        updatedBudgets[relevantBudgetIndex].currentSpent += newTransaction.amount;
        setBudgets(updatedBudgets);
        setBudgetSummary(calculateBudgetSummary(updatedBudgets));
      }
      
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
      setBudgets(prev => [...prev, newBudget]);
      setBudgetSummary(calculateBudgetSummary([...budgets, newBudget]));
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
      const updatedChat = await api.sendChatMessage(content);
      setChatHistory(updatedChat);
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
