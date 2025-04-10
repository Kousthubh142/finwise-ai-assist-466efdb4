
export type TipCategory = 
  | 'savings' 
  | 'budgeting' 
  | 'spending' 
  | 'investing' 
  | 'debt' 
  | 'goals';

export interface AiTip {
  id: string;
  userId: string;
  content: string;
  category: TipCategory;
  createdAt: Date;
  isRead: boolean;
  relevanceScore: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}
