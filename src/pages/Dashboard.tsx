
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
import { ArrowUpRight, PlusCircle, RefreshCw, Sparkles } from 'lucide-react';

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
      <div className="mb-6 animate-slide-in-bottom">
        <h1 className="text-2xl font-bold flex items-center">
          Hello, {user?.name?.split(' ')[0]}
          <Sparkles className="ml-2 h-5 w-5 text-yellow-400" />
        </h1>
        <p className="text-muted-foreground">Here's your financial overview</p>
      </div>
      
      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Balance Card */}
        <Card className="card-modern animate-slide-in-bottom" style={{ animationDelay: '0.05s' }}>
          <CardHeader className="pb-2">
            <CardDescription>Total Balance</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {formatCurrency(12345.67)}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
        
        {/* Monthly Income Card */}
        <Card className="card-modern animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Income</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <CardTitle className="text-2xl bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                {formatCurrency(4500)}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
        
        {/* Monthly Spending Card */}
        <Card className="card-modern animate-slide-in-bottom" style={{ animationDelay: '0.15s' }}>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Spending</CardDescription>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <CardTitle className="text-2xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                {formatCurrency(budgetSummary?.totalSpent || 0)}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
      </div>
      
      {/* Budget overview */}
      <div className="mb-8 animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Budget Overview</h2>
          <Button variant="outline" size="sm" asChild className="button-hover">
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
            {budgetSummary?.categories.slice(0, 3).map((budget, index) => (
              <div 
                key={budget.category} 
                className="animate-slide-in-right"
                style={{ animationDelay: `${0.2 + (index * 0.05)}s` }}
              >
                <BudgetProgressBar
                  category={budget.category}
                  spent={budget.spent}
                  limit={budget.limit}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Charts */}
      <div className="mb-8 animate-slide-in-bottom" style={{ animationDelay: '0.3s' }}>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ChartDashboard />
        )}
      </div>
      
      {/* Recent Transactions and AI Tips in 2 columns on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="animate-slide-in-bottom" style={{ animationDelay: '0.35s' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Button variant="outline" size="sm" asChild className="button-hover">
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
                recentTransactions.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className="animate-slide-in-right mb-3"
                    style={{ animationDelay: `${0.4 + (index * 0.05)}s` }}
                  >
                    <TransactionCard transaction={transaction} />
                  </div>
                ))
              ) : (
                <Card className="card-modern animate-scale-in">
                  <CardContent className="py-6 text-center">
                    <p className="text-muted-foreground mb-4">No transactions yet</p>
                    <Button asChild className="button-hover">
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
        <div className="animate-slide-in-bottom" style={{ animationDelay: '0.4s' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Financial Insights</h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={refreshData}
              disabled={isLoading}
              className="button-hover"
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
                unreadTips.map((tip, index) => (
                  <div 
                    key={tip.id} 
                    className="animate-slide-in-right mb-3"
                    style={{ animationDelay: `${0.45 + (index * 0.05)}s` }}
                  >
                    <AiTipCard tip={tip} />
                  </div>
                ))
              ) : (
                <Card className="card-modern animate-scale-in">
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
