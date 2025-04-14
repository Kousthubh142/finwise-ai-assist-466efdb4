
import { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ChatBubble } from '@/components/ChatBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Bot, MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function Chat() {
  const { chatHistory, sendChatMessage, isLoading } = useFinance();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsSending(true);
    try {
      await sendChatMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Couldn't send message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="mb-20 flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Financial Advisor</h1>
        <p className="text-muted-foreground">Chat with our AI to get personalized financial advice</p>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 pr-2">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-3/4" />
            <Skeleton className="h-20 w-3/4 ml-auto" />
            <Skeleton className="h-20 w-3/4" />
          </div>
        ) : (
          <div>
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageSquare className="h-16 w-16 text-primary/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Ask me anything about your finances</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  I can help with budget advice, savings tips, analyzing your spending habits, and more.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-md">
                  <Button 
                    variant="outline"
                    onClick={() => sendChatMessage("How can I improve my budget this month?")}
                    disabled={isSending}
                  >
                    How can I improve my budget?
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => sendChatMessage("What are my biggest expenses?")}
                    disabled={isSending}
                  >
                    What are my biggest expenses?
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => sendChatMessage("How much should I save for my emergency fund?")}
                    disabled={isSending}
                  >
                    How much should I save?
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => sendChatMessage("Tips for reducing my food expenses")}
                    disabled={isSending}
                  >
                    Tips for reducing expenses
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <div className="sticky bottom-0 bg-background pb-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Ask anything about your finances..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            className="flex-1"
          />
          <Button type="submit" disabled={isSending || !message.trim()}>
            {isSending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
