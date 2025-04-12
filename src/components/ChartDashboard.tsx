
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

  // Urban modern gradient colors for pie chart
  const COLORS = ['#674DEE', '#4ECDC4', '#FF6B6B', '#FFD166', '#06D6A0', '#118AB2', '#073B4C'];

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/90 p-3 rounded-md border border-border text-sm backdrop-blur-sm shadow-lg">
          <p className="font-medium capitalize">{payload[0].name}</p>
          <p className="text-primary font-medium">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="card-modern overflow-hidden">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="expenses" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-background/50 p-1">
            <TabsTrigger 
              value="expenses" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              Expenses by Category
            </TabsTrigger>
            <TabsTrigger 
              value="income"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
            >
              Income vs Expenses
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="expenses" className="h-64 animate-slide-in-right">
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
                  animationBegin={200}
                  animationDuration={800}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="animate-pulse-soft"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="income" className="h-64 animate-slide-in-right">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => [`${formatCurrency(value as number)}`, 'Amount']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(4px)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  name="Amount" 
                  fill="url(#colorGradient)" 
                  radius={[4, 4, 0, 0]} 
                  animationBegin={200}
                  animationDuration={800}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#674DEE" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#674DEE" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
