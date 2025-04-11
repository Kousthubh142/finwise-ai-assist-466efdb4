
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { api } from '../services/api';
import { Transaction } from '../models/Transaction';
import { Budget, BudgetSummary } from '../models/Budget';
import { SavingsGoal } from '../models/Goal';
import { AiTip } from '../models/AiTip';
import { 
  ArrowDownLeft,
  ArrowUpRight,
  Home,
  List,
  PieChart,
  Target,
  MessageCircle,
  RefreshCw,
  PlusCircle 
} from 'lucide-react';

interface DashboardScreenProps {
  navigation?: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [tips, setTips] = useState<AiTip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [transactionsData, budgetsData, goalsData, tipsData] = await Promise.all([
        api.getTransactions(),
        api.getBudgets(),
        api.getSavingsGoals(),
        api.getAiTips()
      ]);

      setTransactions(transactionsData);
      setBudgets(budgetsData);
      setGoals(goalsData);
      setTips(tipsData);

      // Calculate budget summary
      const totalBudget = budgetsData.reduce((sum, budget) => sum + budget.limit, 0);
      const totalSpent = budgetsData.reduce((sum, budget) => sum + budget.currentSpent, 0);
      const remaining = totalBudget - totalSpent;
      const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      const categories = budgetsData.map(budget => ({
        category: budget.category,
        limit: budget.limit,
        spent: budget.currentSpent,
        remaining: budget.limit - budget.currentSpent,
        percentUsed: budget.limit > 0 ? (budget.currentSpent / budget.limit) * 100 : 0
      }));

      setBudgetSummary({
        totalBudget,
        totalSpent,
        remaining,
        percentUsed,
        categories
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  // Get recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hello, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-gray-600">Here's your financial overview</p>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Total Balance</p>
          <p className="text-xl font-bold">{formatCurrency(12345.67)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Monthly Income</p>
          <p className="text-xl font-bold text-purple-600">{formatCurrency(4500)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500 mb-1">Monthly Spending</p>
          <p className="text-xl font-bold">{formatCurrency(budgetSummary?.totalSpent || 0)}</p>
        </div>
      </div>

      {/* Budget overview */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Budget Overview</h2>
          <button 
            className="flex items-center bg-gray-100 text-purple-600 px-3 py-1 rounded-lg"
            onClick={() => navigation?.navigate('Budget')}
          >
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>Details</span>
          </button>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          {budgetSummary?.categories.slice(0, 3).map((budget, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 capitalize">
                  {budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}
                </span>
                <span className="text-gray-600">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                </span>
              </div>
              <ProgressBar 
                progress={budget.percentUsed} 
                progressColor={(progress) => {
                  if (progress < 70) return '#8B5CF6';
                  if (progress < 90) return '#F59E0B';
                  return '#EF4444';
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <button 
            className="flex items-center bg-gray-100 text-purple-600 px-3 py-1 rounded-lg"
            onClick={() => navigation?.navigate('Transactions')}
          >
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>All Transactions</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {recentTransactions.map((transaction, index) => (
            <div 
              key={index} 
              className={`flex items-center p-4 ${
                index !== recentTransactions.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                {transaction.isIncome ? (
                  <ArrowDownLeft className="w-5 h-5 text-green-500" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-red-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-gray-800 font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">{transaction.category}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.isIncome ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          
          {recentTransactions.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">No transactions yet</p>
              <button 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
                onClick={() => navigation?.navigate('AddTransaction')}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                <span>Add Transaction</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Financial Insights */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Financial Insights</h2>
          <button 
            className="bg-gray-100 text-purple-600 p-2 rounded-lg"
            onClick={onRefresh}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {tips.filter(tip => !tip.isRead).slice(0, 2).map((tip, index) => (
            <div 
              key={index} 
              className={`p-4 ${index !== 0 ? 'border-t border-gray-200' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-purple-600 font-medium capitalize">{tip.category}</span>
                <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                  New
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">{tip.content}</p>
            </div>
          ))}
          
          {tips.filter(tip => !tip.isRead).length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                No new insights available. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
