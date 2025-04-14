
import { ThemeToggle } from '@/components/ThemeToggle';

export const AuthHeader = () => {
  return (
    <div className="w-full max-w-md mb-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          FinWise
        </h1>
        <ThemeToggle />
      </div>
    </div>
  );
};
