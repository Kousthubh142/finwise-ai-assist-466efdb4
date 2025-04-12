import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, PlusCircle, Target, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';

export function MainSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Budget', icon: BarChart2, path: '/budget' },
    { name: 'Goals', icon: Target, path: '/goals' },
    { name: 'AI Chat', icon: MessageSquare, path: '/chat' },
  ];

  return (
    <Sidebar className="border-r border-border/50 backdrop-blur-sm bg-sidebar/80">
      <SidebarHeader className="flex items-center justify-between px-4 h-16">
        <h1 className="text-xl font-bold">
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            FinWise
          </span>
        </h1>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, index) => (
                <SidebarMenuItem 
                  key={item.path} 
                  className={`animate-slide-in-bottom`} 
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <SidebarMenuButton 
                    asChild
                    isActive={currentPath === item.path}
                    tooltip={item.name}
                    className="transition-all duration-200"
                  >
                    <Link to={item.path} className="group">
                      <item.icon className={cn(
                        "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                        currentPath === item.path ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "transition-colors duration-200",
                        currentPath === item.path && "font-medium"
                      )}>
                        {item.name}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
            Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="animate-slide-in-bottom" style={{ animationDelay: '0.25s' }}>
                <SidebarMenuButton 
                  asChild
                  isActive={currentPath === '/add-transaction'}
                  tooltip="Add Transaction"
                  className="transition-all duration-200"
                >
                  <Link to="/add-transaction" className="group">
                    <PlusCircle className={cn(
                      "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                      currentPath === '/add-transaction' ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "transition-colors duration-200",
                      currentPath === '/add-transaction' && "font-medium"
                    )}>
                      Add Transaction
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="px-4 py-2 border-t border-border/30">
        <div className="text-xs text-muted-foreground opacity-70 hover:opacity-100 transition-opacity">
          FinWise © 2025
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
