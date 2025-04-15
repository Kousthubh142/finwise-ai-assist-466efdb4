
import { ChatMessage } from '@/models/aiTip';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';

type ChatBubbleProps = {
  message: ChatMessage;
};

export function ChatBubble({ message }: ChatBubbleProps) {
  const isAi = message.sender === 'ai';
  
  return (
    <div className={cn(
      "flex",
      isAi ? "justify-start" : "justify-end",
      "mb-4"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-lg p-3",
        isAi 
          ? "bg-muted text-foreground rounded-tl-none" 
          : "bg-primary text-primary-foreground rounded-tr-none"
      )}>
        <p className="text-sm whitespace-pre-line">{message.content}</p>
        <p className={cn(
          "text-xs mt-1 text-right",
          isAi ? "text-muted-foreground" : "text-primary-foreground/80"
        )}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
