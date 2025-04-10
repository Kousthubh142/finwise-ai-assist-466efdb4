
import { Home, BarChart2, PlusCircle, Target, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Budget', icon: BarChart2, path: '/budget' },
    { name: 'Add', icon: PlusCircle, path: '/add-transaction' },
    { name: 'Goals', icon: Target, path: '/goals' },
    { name: 'AI Chat', icon: MessageSquare, path: '/chat' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around z-10 md:hidden">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full",
            currentPath === item.path 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <item.icon size={20} className="mb-1" />
          <span className="text-xs">{item.name}</span>
        </Link>
      ))}
    </div>
  );
}
