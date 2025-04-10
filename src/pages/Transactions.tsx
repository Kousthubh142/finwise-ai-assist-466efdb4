
import { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { TransactionCard } from '@/components/TransactionCard';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { PlusCircle, Filter, Search, RefreshCw } from 'lucide-react';

export default function Transactions() {
  const { transactions, isLoading, refreshData } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // Filter by income/expense
    if (filter === 'income') {
      filtered = filtered.filter(t => t.isIncome);
    } else if (filter === 'expense') {
      filtered = filtered.filter(t => !t.isIncome);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(term) ||
        t.category.toLowerCase().includes(term)
      );
    }
    
    // Sort transactions
    switch (sortBy) {
      case 'date-desc':
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'date-asc':
        return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'amount-desc':
        return filtered.sort((a, b) => b.amount - a.amount);
      case 'amount-asc':
        return filtered.sort((a, b) => a.amount - b.amount);
      default:
        return filtered;
    }
  }, [transactions, filter, categoryFilter, searchTerm, sortBy]);

  // Get all available categories from transactions
  const availableCategories = useMemo(() => {
    const categories = transactions.map(t => t.category);
    return [...new Set(categories)];
  }, [transactions]);

  return (
    <div className="mb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link to="/add-transaction">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter and search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as any)}>
          <SelectTrigger>
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <span>Category: {categoryFilter === 'all' ? 'All' : categoryFilter}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {availableCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
          <SelectTrigger>
            <span>Sort by</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest first</SelectItem>
            <SelectItem value="date-asc">Oldest first</SelectItem>
            <SelectItem value="amount-desc">Highest amount</SelectItem>
            <SelectItem value="amount-asc">Lowest amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for All/Income/Expenses */}
      <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Transactions list */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <div>
          {filteredTransactions.length > 0 ? (
            <div>
              {filteredTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No transactions found</p>
                {searchTerm || categoryFilter !== 'all' ? (
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                  }}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/add-transaction">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Transaction
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
