
import { Card, CardContent } from '@/components/ui/card';
import { AiTip } from '@/models/AiTip';
import { Lightbulb, BarChart, PiggyBank, DollarSign, Target, Coins } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type AiTipCardProps = {
  tip: AiTip;
};

export function AiTipCard({ tip }: AiTipCardProps) {
  // Get the appropriate icon based on category
  const getIcon = () => {
    switch (tip.category) {
      case 'budgeting':
        return <BarChart className="h-5 w-5 text-primary" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5 text-secondary" />;
      case 'spending':
        return <DollarSign className="h-5 w-5 text-accent" />;
      case 'investing':
        return <Coins className="h-5 w-5 text-primary" />;
      case 'goals':
        return <Target className="h-5 w-5 text-accent" />;
      default:
        return <Lightbulb className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          <div>
            <p className="text-sm mb-2">{tip.content}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(tip.createdAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
