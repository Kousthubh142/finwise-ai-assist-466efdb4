
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SavingsGoal } from '@/models/goal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, Check, Target } from 'lucide-react';
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
  index?: number;
};

export function GoalCard({ goal, index = 0 }: GoalCardProps) {
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
    <Card 
      className="mb-4 overflow-hidden card-hover animate-slide-in-bottom card-modern"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div 
        className="h-24 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/5 backdrop-blur-xs"></div>
        {goal.imageUrl ? (
          <img 
            src={goal.imageUrl} 
            alt={goal.name}
            className="w-16 h-16 object-cover rounded-full border-4 border-background shadow-lg z-10 animate-float"
          />
        ) : (
          <div className="w-16 h-16 rounded-full border-4 border-background shadow-lg bg-primary/10 flex items-center justify-center z-10 animate-float">
            <Target className="h-8 w-8 text-primary" />
          </div>
        )}
      </div>
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold text-center mb-1 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {goal.name}
        </h3>
        
        {goal.deadline && (
          <p className="text-xs text-center text-muted-foreground mb-3">
            Target date: {formatDate(goal.deadline)}
          </p>
        )}
        
        <div className="mb-4">
          <Progress 
            value={progress} 
            className="h-2 mb-2 bg-secondary/50 overflow-hidden" 
          />
          <div className="flex justify-between text-sm">
            <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
            <span className="text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/50 text-xs">
              {progress.toFixed(0)}%
            </span>
            <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>
        
        {goal.isCompleted ? (
          <Button 
            className="w-full button-hover bg-green-500 hover:bg-green-600 group"
            disabled
          >
            <Check className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Completed</span>
          </Button>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full button-hover group">
                <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                <span>Add Funds</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="card-modern animate-scale-in">
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
                  className="text-right focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="button-hover"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleContribute}
                  className="button-hover"
                >
                  Contribute
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
