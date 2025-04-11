
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SavingsGoal } from '@/models/Goal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type GoalCardProps = {
  goal: SavingsGoal;
};

export function GoalCard({ goal }: GoalCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const { updateSavingsGoal } = useFinance();
  
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = goal.targetAmount - goal.currentAmount;
  
  const handleContribute = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    
    await updateSavingsGoal(goal.id, amountNum);
    setAmount('');
    setIsDialogOpen(false);
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <div 
        className="h-24 bg-gradient-to-r from-primary/30 to-secondary/30 flex items-center justify-center"
      >
        <img 
          src={goal.imageUrl || '/placeholder.svg'} 
          alt={goal.name}
          className="w-16 h-16 object-cover rounded-full border-4 border-background"
        />
      </div>
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold text-center mb-1">{goal.name}</h3>
        
        {goal.deadline && (
          <p className="text-xs text-center text-muted-foreground mb-3">
            Target date: {formatDate(goal.deadline)}
          </p>
        )}
        
        <div className="mb-4">
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex justify-between text-sm">
            <span>{formatCurrency(goal.currentAmount)}</span>
            <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
            <span>{formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>
        
        {goal.isCompleted ? (
          <Button 
            className="w-full" 
            variant="secondary"
            disabled
          >
            <Check className="mr-2 h-4 w-4" />
            Completed
          </Button>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contribute to {goal.name}</DialogTitle>
                <DialogDescription>
                  You need {formatCurrency(remaining)} more to reach your goal.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium mb-2 block">
                  Amount to add:
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-right"
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleContribute}>Contribute</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
