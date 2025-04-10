
import { useState } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { BudgetProgressBar } from '@/components/BudgetProgressBar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionCategory } from '@/models/transaction';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle, PiggyBank } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Budget() {
  const { budgets, budgetSummary, createBudget, isLoading } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: 'food' as TransactionCategory,
    limit: '',
    period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
  });

  const handleCreateBudget = async () => {
    if (!newBudget.category || !newBudget.limit) return;
    
    await createBudget({
      category: newBudget.category,
      limit: parseFloat(newBudget.limit),
      period: newBudget.period,
    });
    
    setNewBudget({
      category: 'food',
      limit: '',
      period: 'monthly',
    });
    
    setIsDialogOpen(false);
  };

  // Prepare data for pie chart
  const categoryData = budgets.map(budget => ({
    name: budget.category.replace('_', ' '),
    value: budget.currentSpent,
  })).filter(item => item.value > 0);

  // Colors for pie chart sectors
  const COLORS = ['#674DEE', '#4ECDC4', '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'];

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 rounded-md border border-border text-sm">
          <p className="font-medium capitalize">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Prepare available categories
  const availableCategories: TransactionCategory[] = [
    'food', 'housing', 'transportation', 'utilities', 
    'healthcare', 'entertainment', 'shopping', 
    'education', 'personal', 'other'
  ];
  
  // Filter out categories that already have budgets
  const unusedCategories = availableCategories.filter(
    category => !budgets.some(budget => budget.category === category)
  );

  return (
    <div className="mb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budget Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a specific category.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newBudget.category}
                  onValueChange={(value) => setNewBudget({ ...newBudget, category: value as TransactionCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {unusedCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="limit">Monthly Limit</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="limit"
                    type="number"
                    className="pl-8"
                    placeholder="0.00"
                    value={newBudget.limit}
                    onChange={(e) => setNewBudget({ ...newBudget, limit: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="period">Time Period</Label>
                <Select
                  value={newBudget.period}
                  onValueChange={(value) => setNewBudget({ ...newBudget, period: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBudget}>
                Create Budget
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Budget Summary</CardTitle>
          <CardDescription>
            Your overall budget status for this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div>
              <div className="flex justify-between mb-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(budgetSummary?.totalBudget || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(budgetSummary?.totalSpent || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-xl font-semibold text-secondary">
                    {formatCurrency(budgetSummary?.remaining || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Details */}
      <Tabs defaultValue="categories">
        <TabsList className="mb-6">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <div>
              {budgets.length > 0 ? (
                budgets.map((budget) => (
                  <BudgetProgressBar
                    key={budget.id}
                    category={budget.category}
                    spent={budget.currentSpent}
                    limit={budget.limit}
                  />
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <PiggyBank className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Budgets Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first budget to start tracking your spending.
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Budget
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="visualization">
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground">
                        No spending data available yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
