
import { Button } from '@/components/ui/button';

interface DemoCredentialsProps {
  onUseDemo: () => void;
}

export const DemoCredentials = ({ onUseDemo }: DemoCredentialsProps) => {
  return (
    <div className="mt-8 text-center text-sm text-muted-foreground">
      <p>Demo credentials are pre-filled for you.</p>
      <p className="mt-1">
        <Button
          variant="link"
          className="h-auto p-0"
          onClick={onUseDemo}
        >
          Use demo account
        </Button>
      </p>
    </div>
  );
};
