
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  const [goals, setGoals] = useState({
    emergency: false,
    retirement: false,
    house: false,
    debt: false,
    travel: false,
    education: false
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleNextStep = () => {
    if (step === 1 && !monthlyIncome) {
      toast({
        title: 'Error',
        description: 'Please enter your monthly income',
        variant: 'destructive',
      });
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const completeOnboarding = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Unable to update profile. User not found.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Convert selected goals to array
      const financialGoals = Object.entries(goals)
        .filter(([_, selected]) => selected)
        .map(([goal]) => goal);
      
      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          monthly_income: parseFloat(monthlyIncome),
          risk_tolerance: riskTolerance,
          financial_goals: financialGoals
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Your profile has been set up!',
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleGoal = (goal: keyof typeof goals) => {
    setGoals(prev => ({
      ...prev,
      [goal]: !prev[goal]
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md mb-6">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to FinWise
        </h1>
        <p className="text-muted-foreground">
          Let's set up your profile to get personalized recommendations.
        </p>
      </div>
      
      <Card className="w-full max-w-md mb-6">
        <CardContent className="pt-6">
          {/* Step 1: Monthly Income */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">What's your monthly income?</h2>
              <div className="space-y-2">
                <Label htmlFor="monthly-income">Monthly Income</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="monthly-income"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  This helps us understand your spending capacity and create appropriate budgets.
                </p>
              </div>
            </div>
          )}
          
          {/* Step 2: Risk Tolerance */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">What's your financial risk tolerance?</h2>
              <RadioGroup value={riskTolerance} onValueChange={(value) => setRiskTolerance(value as 'low' | 'medium' | 'high')}>
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="low" id="risk-low" />
                  <Label htmlFor="risk-low" className="font-medium">Conservative</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-6 ml-6">
                  I prefer stability and low risk, even if it means lower returns.
                </p>
                
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="medium" id="risk-medium" />
                  <Label htmlFor="risk-medium" className="font-medium">Moderate</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-6 ml-6">
                  I'm comfortable with some risk for potentially better returns.
                </p>
                
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value="high" id="risk-high" />
                  <Label htmlFor="risk-high" className="font-medium">Aggressive</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4 ml-6">
                  I'm willing to take significant risks for potentially higher returns.
                </p>
              </RadioGroup>
            </div>
          )}
          
          {/* Step 3: Financial Goals */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">What are your financial goals?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Select all that apply to you.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="goal-emergency" 
                    checked={goals.emergency} 
                    onCheckedChange={() => toggleGoal('emergency')} 
                  />
                  <div>
                    <Label htmlFor="goal-emergency" className="font-medium">Emergency Fund</Label>
                    <p className="text-sm text-muted-foreground">
                      Save 3-6 months of expenses for emergencies
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="goal-retirement" 
                    checked={goals.retirement} 
                    onCheckedChange={() => toggleGoal('retirement')} 
                  />
                  <div>
                    <Label htmlFor="goal-retirement" className="font-medium">Retirement</Label>
                    <p className="text-sm text-muted-foreground">
                      Save for long-term retirement needs
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="goal-house" 
                    checked={goals.house} 
                    onCheckedChange={() => toggleGoal('house')} 
                  />
                  <div>
                    <Label htmlFor="goal-house" className="font-medium">Buy a House</Label>
                    <p className="text-sm text-muted-foreground">
                      Save for a down payment on a home
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="goal-debt" 
                    checked={goals.debt} 
                    onCheckedChange={() => toggleGoal('debt')} 
                  />
                  <div>
                    <Label htmlFor="goal-debt" className="font-medium">Pay Off Debt</Label>
                    <p className="text-sm text-muted-foreground">
                      Eliminate credit card or student loan debt
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="goal-travel" 
                    checked={goals.travel} 
                    onCheckedChange={() => toggleGoal('travel')} 
                  />
                  <div>
                    <Label htmlFor="goal-travel" className="font-medium">Travel/Vacation</Label>
                    <p className="text-sm text-muted-foreground">
                      Save for trips and experiences
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="goal-education" 
                    checked={goals.education} 
                    onCheckedChange={() => toggleGoal('education')} 
                  />
                  <div>
                    <Label htmlFor="goal-education" className="font-medium">Education</Label>
                    <p className="text-sm text-muted-foreground">
                      Save for further education or children's education
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="w-full max-w-md flex gap-2">
        {step > 1 && (
          <Button variant="outline" onClick={handlePrevStep} className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={handleNextStep} className="flex-1">
          {step < 3 ? 'Next' : 'Finish'}
        </Button>
      </div>
      
      <div className="w-full max-w-md mt-6 flex justify-center">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-10 rounded-full ${
                s === step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
