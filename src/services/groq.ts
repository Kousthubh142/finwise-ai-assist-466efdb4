
import { ChatMessage } from '@/models/aiTip';

// This is a placeholder class that will be replaced with actual Groq API integration
// once we have the API key
export class GroqService {
  private apiKey: string | null = null;
  
  setApiKey(key: string) {
    this.apiKey = key;
    console.log('Groq API key set successfully');
  }
  
  async getChatCompletion(messages: { role: 'system' | 'user' | 'assistant', content: string }[]): Promise<string> {
    if (!this.apiKey) {
      console.warn('Groq API key not set, using mock response');
      return this.getMockResponse(messages);
    }
    
    try {
      // Here we would make the actual API call
      // For now, returning mock data until API key is provided
      return this.getMockResponse(messages);
    } catch (error) {
      console.error('Error calling Groq API:', error);
      throw new Error('Failed to get AI response');
    }
  }
  
  // This will be used until the API key is provided and real implementation is added
  private getMockResponse(messages: { role: string, content: string }[]): string {
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    
    // Generate a simple response based on the last user message
    if (userMessage.toLowerCase().includes('budget')) {
      return "Based on your transaction history, I recommend allocating 50% of your income to necessities, 30% to wants, and 20% to savings. Your current spending in the food category seems higher than recommended.";
    } else if (userMessage.toLowerCase().includes('save')) {
      return "For emergency funds, it's recommended to save 3-6 months of living expenses. Based on your spending, you should aim for around $12,000 in your emergency fund.";
    } else if (userMessage.toLowerCase().includes('investment') || userMessage.toLowerCase().includes('invest')) {
      return "With your current risk profile, I recommend a diversified portfolio with 60% stocks, 30% bonds, and 10% cash equivalents. Consider maximizing your retirement contributions before other investments.";
    } else if (userMessage.toLowerCase().includes('expense') || userMessage.toLowerCase().includes('spending')) {
      return "Your top three expense categories are: Housing (35%), Food (22%), and Transportation (15%). There's potential to reduce your food expenses by about 25% based on similar profiles.";
    }
    
    return "To improve your financial health, consider setting specific, measurable financial goals. Would you like recommendations for budgeting, saving, investing, or reducing expenses?";
  }
  
  // Helper method to format chat history for the AI
  formatChatHistory(chatHistory: ChatMessage[]): { role: 'system' | 'user' | 'assistant', content: string }[] {
    // Start with a system message
    const formatted: { role: 'system' | 'user' | 'assistant', content: string }[] = [
      {
        role: 'system',
        content: 'You are a helpful and knowledgeable financial advisor. Provide personalized, practical advice based on the user\'s financial situation and questions. Be specific, actionable, and encouraging.'
      }
    ];
    
    // Add chat history
    chatHistory.forEach(message => {
      formatted.push({
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.content
      });
    });
    
    return formatted;
  }
}

// Create a singleton instance
export const groqService = new GroqService();
