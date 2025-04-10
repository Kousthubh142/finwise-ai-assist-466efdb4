
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { TransactionCategory } from "@/models/transaction";
import { 
  Home, 
  ShoppingBag, 
  Car, 
  Utensils, 
  Zap, 
  HeartPulse, 
  Gamepad, 
  GraduationCap, 
  User, 
  DollarSign, 
  PiggyBank, 
  HelpCircle,
  LucideIcon
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

export function formatDate(date: Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatTime(date: Date): string {
  return format(new Date(date), 'h:mm a');
}

export function getCategoryIcon(category: TransactionCategory): LucideIcon {
  switch (category) {
    case 'housing':
      return Home;
    case 'food':
      return Utensils;
    case 'transportation':
      return Car;
    case 'utilities':
      return Zap;
    case 'healthcare':
      return HeartPulse;
    case 'entertainment':
      return Gamepad;
    case 'shopping':
      return ShoppingBag;
    case 'education':
      return GraduationCap;
    case 'personal':
      return User;
    case 'income':
      return DollarSign;
    case 'savings':
      return PiggyBank;
    default:
      return HelpCircle;
  }
}

export const getCategoryColor = (category: TransactionCategory): string => {
  switch (category) {
    case 'housing':
      return 'bg-blue-500';
    case 'food':
      return 'bg-green-500';
    case 'transportation':
      return 'bg-yellow-500';
    case 'utilities':
      return 'bg-orange-500';
    case 'healthcare':
      return 'bg-red-500';
    case 'entertainment':
      return 'bg-purple-500';
    case 'shopping':
      return 'bg-pink-500';
    case 'education':
      return 'bg-indigo-500';
    case 'personal':
      return 'bg-cyan-500';
    case 'income':
      return 'bg-teal-500';
    case 'savings':
      return 'bg-emerald-500';
    default:
      return 'bg-gray-500';
  }
};
