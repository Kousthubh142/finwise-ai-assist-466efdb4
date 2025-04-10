
import { useAuth } from '@/context/AuthContext';
import { Outlet, useNavigate } from 'react-router-dom';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  LogOut, 
  Settings, 
  User,
  Bell
} from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function LayoutWrapper() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Display only the page content if not authenticated
  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FinWise
            </h1>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-2">
            {mounted && <ThemeToggle />}
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-accent"></span>
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {user?.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>My Account</SheetTitle>
                </SheetHeader>
                
                <div className="py-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">{user?.name}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-between" asChild>
                      <div>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile Settings</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-between" asChild>
                      <div>
                        <div className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Preferences</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      
      {/* Page Content */}
      <main className="container py-4">
        <Outlet />
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
