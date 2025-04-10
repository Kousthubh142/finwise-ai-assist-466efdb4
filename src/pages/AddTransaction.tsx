
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/context/FinanceContext';
import { TransactionCategory } from '@/models/transaction';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export default function AddTransaction() {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  const { addTransaction } = useFinance();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const expenseCategories: TransactionCategory[] = [
    'food', 'housing', 'transportation', 'utilities', 
    'healthcare', 'entertainment', 'shopping', 'education', 
    'personal', 'other'
  ];
  
  const incomeCategories: TransactionCategory[] = [
    'income', 'savings', 'other'
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      toast({
        title: 'Error',
        description: 'Please fill all the required fields',
        variant: 'destructive',
      });
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await addTransaction({
        amount: amountValue,
        description,
        category,
        isIncome: type === 'income',
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        date: new Date(),
      });
      
      navigate('/transactions');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="mb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add Transaction</h1>
        <p className="text-muted-foreground">Record your income or expenses</p>
      </div>
      
      <Card>
        <CardHeader>
          <Tabs
            defaultValue="expense"
            onValueChange={(v) => setType(v as 'expense' | 'income')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense" className="data-[state=active]:bg-destructive/10">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Expense
              </TabsTrigger>
              <TabsTrigger value="income" className="data-[state=active]:bg-secondary/10">
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Income
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as TransactionCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="recurring">Recurring Transaction</Label>
                <p className="text-sm text-muted-foreground">
                  Will this transaction happen regularly?
                </p>
              </div>
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
            </div>
            
            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={recurringFrequency}
                  onValueChange={(value) => setRecurringFrequency(value as any)}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/transactions')}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Transaction
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
