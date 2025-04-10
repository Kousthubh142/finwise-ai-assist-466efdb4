
import { useAuth } from '@/context/AuthContext';
import { useFinance } from '@/context/FinanceContext';
import { formatCurrency } from '@/lib/utils';
import { BudgetProgressBar } from '@/components/BudgetProgressBar';
import { TransactionCard } from '@/components/TransactionCard';
import { AiTipCard } from '@/components/AiTipCard';
import { ChartDashboard } from '@/components/ChartDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowUpRight, PlusCircle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    transactions, 
    budgetSummary, 
    savingsGoals, 
    aiTips,
    isLoading,
    refreshData
  } = useFinance();
  
  // Get recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get unread AI tips
  const unreadTips = aiTips.filter(tip => !tip.isRead).slice(0, 3);
  
  return (
    <div className="mb-20">
      {/* Header with welcome and total balance */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Hello, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground">Here's your financial overview</p>
      </div>
      
      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Balance Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Balance</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <CardTitle className="text-2xl">
                {formatCurrency(12345.67)}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
        
        {/* Monthly Income Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Income</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <CardTitle className="text-2xl text-secondary">
                {formatCurrency(4500)}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
        
        {/* Monthly Spending Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Spending</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <CardTitle className="text-2xl">
                {formatCurrency(budgetSummary?.totalSpent || 0)}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
      </div>
      
      {/* Budget overview */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Budget Overview</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/budget">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Details
            </Link>
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div>
            {budgetSummary?.categories.slice(0, 3).map((budget) => (
              <BudgetProgressBar
                key={budget.category}
                category={budget.category}
                spent={budget.spent}
                limit={budget.limit}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Charts */}
      <div className="mb-8">
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ChartDashboard />
        )}
      </div>
      
      {/* Recent Transactions and AI Tips in 2 columns on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/transactions">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                All Transactions
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="py-6 text-center">
                    <p className="text-muted-foreground mb-4">No transactions yet</p>
                    <Button asChild>
                      <Link to="/add-transaction">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
        
        {/* AI Tips */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Financial Insights</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div>
              {unreadTips.length > 0 ? (
                unreadTips.map((tip) => (
                  <AiTipCard key={tip.id} tip={tip} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-muted-foreground text-center">
                      No new insights available. Check back later!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
