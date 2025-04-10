
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance } from '@/context/FinanceContext';
import { BarChart, Legend, Tooltip, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TransactionCategory } from '@/models/transaction';
import { formatCurrency } from '@/lib/utils';

export function ChartDashboard() {
  const { transactions, budgets, getCategoryTotal } = useFinance();

  // Prepare data for expense by category pie chart
  const categoryData = budgets.map(budget => ({
    name: budget.category.replace('_', ' '),
    value: getCategoryTotal(budget.category),
  })).filter(item => item.value > 0);

  // Calculate total income and expenses
  const income = transactions
    .filter(t => t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => !t.isIncome)
    .reduce((sum, t) => sum + t.amount, 0);

  // Prepare data for income vs expenses bar chart
  const compareData = [
    { name: 'Income', value: income },
    { name: 'Expenses', value: expenses }
  ];

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expenses">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="expenses">Expenses by Category</TabsTrigger>
            <TabsTrigger value="income">Income vs Expenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
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
          </TabsContent>
          
          <TabsContent value="income" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData}>
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`${formatCurrency(value as number)}`, 'Amount']}
                />
                <Bar 
                  dataKey="value" 
                  name="Amount" 
                  fill="#674DEE" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
