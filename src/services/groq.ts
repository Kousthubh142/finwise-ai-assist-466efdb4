
import { ChatMessage } from '@/models/aiTip';

type Role = 'system' | 'user' | 'assistant';

export class GroqService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
  private model = 'llama-3.3-70b-versatile';
  
  setApiKey(key: string) {
    this.apiKey = key;
    console.log('Groq API key set successfully');
  }
  
  async getChatCompletion(messages: { role: Role, content: string }[]): Promise<string> {
    if (!this.apiKey) {
      console.warn('Groq API key not set, using mock response');
      return this.getMockResponse(messages);
    }
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Groq API error:', errorData);
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Groq API:', error);
      // Fall back to mock response if API call fails
      return this.getMockResponse(messages);
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
  formatChatHistory(chatHistory: ChatMessage[]): { role: Role, content: string }[] {
    // Start with a system message
    const formatted: { role: Role, content: string }[] = [
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
