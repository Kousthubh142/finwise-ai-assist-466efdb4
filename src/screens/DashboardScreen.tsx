
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { api } from '../services/api';
import { Transaction } from '../models/Transaction';
import { Budget, BudgetSummary } from '../models/Budget';
import { SavingsGoal } from '../models/Goal';
import { AiTip } from '../models/AiTip';

interface DashboardScreenProps {
  navigation: any;
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}</Text>
            <Text style={styles.subGreeting}>Here's your financial overview</Text>
          </View>
        </View>

        {/* Quick stats cards */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Total Balance</Text>
            <Text style={styles.statValue}>{formatCurrency(12345.67)}</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Monthly Income</Text>
            <Text style={[styles.statValue, styles.incomeValue]}>{formatCurrency(4500)}</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Monthly Spending</Text>
            <Text style={styles.statValue}>{formatCurrency(budgetSummary?.totalSpent || 0)}</Text>
          </Card>
        </View>

        {/* Budget overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budget Overview</Text>
            <TouchableOpacity 
              style={styles.sectionButton}
              onPress={() => navigation.navigate('Budget')}
            >
              <Feather name="arrow-up-right" size={16} color="#8B5CF6" />
              <Text style={styles.sectionButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <Card>
            {budgetSummary?.categories.slice(0, 3).map((budget, index) => (
              <View key={index} style={styles.budgetItem}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetCategory}>
                    {budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}
                  </Text>
                  <Text style={styles.budgetValues}>
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                  </Text>
                </View>
                <ProgressBar 
                  progress={budget.percentUsed} 
                  progressColor={(progress) => {
                    if (progress < 70) return '#8B5CF6';
                    if (progress < 90) return '#F59E0B';
                    return '#EF4444';
                  }}
                />
              </View>
            ))}
          </Card>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity 
              style={styles.sectionButton}
              onPress={() => navigation.navigate('Transactions')}
            >
              <Feather name="arrow-up-right" size={16} color="#8B5CF6" />
              <Text style={styles.sectionButtonText}>All Transactions</Text>
            </TouchableOpacity>
          </View>
          
          <Card>
            {recentTransactions.map((transaction, index) => (
              <View key={index} style={[styles.transactionItem, index !== recentTransactions.length - 1 && styles.borderBottom]}>
                <View style={styles.transactionIcon}>
                  <Feather 
                    name={transaction.isIncome ? "arrow-down-left" : "arrow-up-right"} 
                    size={20} 
                    color={transaction.isIncome ? "#10B981" : "#EF4444"} 
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionCategory}>{transaction.category}</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionValue,
                    transaction.isIncome ? styles.incomeText : styles.expenseText
                  ]}>
                    {transaction.isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
            
            {recentTransactions.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No transactions yet</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => navigation.navigate('AddTransaction')}
                >
                  <Feather name="plus-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add Transaction</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        </View>
        
        {/* Financial Insights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Financial Insights</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <Feather name="refresh-cw" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
          
          <Card>
            {tips.filter(tip => !tip.isRead).slice(0, 2).map((tip, index) => (
              <View key={index} style={[styles.tipItem, index !== 0 && styles.borderTop]}>
                <View style={styles.tipHeader}>
                  <Text style={styles.tipCategory}>{tip.category}</Text>
                  <View style={styles.tipBadge}>
                    <Text style={styles.tipBadgeText}>New</Text>
                  </View>
                </View>
                <Text style={styles.tipContent}>{tip.content}</Text>
              </View>
            ))}
            
            {tips.filter(tip => !tip.isRead).length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No new insights available. Check back later!
                </Text>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // For bottom tab navigation
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subGreeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  incomeValue: {
    color: '#8B5CF6',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sectionButtonText: {
    fontSize: 14,
    color: '#8B5CF6',
    marginLeft: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  budgetItem: {
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  budgetValues: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  incomeText: {
    color: '#10B981',
  },
  expenseText: {
    color: '#EF4444',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  tipItem: {
    paddingVertical: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
    textTransform: 'capitalize',
  },
  tipBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tipBadgeText: {
    fontSize: 12,
    color: '#8B5CF6',
  },
  tipContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default DashboardScreen;
