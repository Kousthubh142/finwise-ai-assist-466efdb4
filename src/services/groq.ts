
import { ChatMessage } from '@/models/aiTip';

// Define the Role type for clarity
export type Role = 'system' | 'user' | 'assistant';

// Message type for the Groq API
export interface GroqMessage {
  role: Role;
  content: string;
}

class GroqService {
  private apiKey: string | null = null;
  private model = 'llama3-70b-8192';  // Default model
  private apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    // Try to get API key from environment
    this.tryInitializeApiKey();
  }

  private async tryInitializeApiKey() {
    try {
      // This would be set via Supabase secrets in production
      this.apiKey = 'YOUR_GROQ_API_KEY';
    } catch (error) {
      console.error('Failed to initialize Groq API key:', error);
    }
  }

  public formatChatHistory(history: ChatMessage[]): GroqMessage[] {
    // Format the chat history for Groq API
    return history.map(message => ({
      role: message.sender === 'user' ? 'user' as Role : 'assistant' as Role,
      content: message.content
    }));
  }

  public async getChatCompletion(messages: GroqMessage[]): Promise<string> {
    try {
      if (!this.apiKey) {
        await this.tryInitializeApiKey();
        if (!this.apiKey) {
          console.warn('Groq API key not available, returning fallback response');
          return "I'm sorry, I can't process your request right now. The AI service is not properly configured.";
        }
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Groq API error:', errorData);
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error getting chat completion:', error);
      return "I'm sorry, there was an error processing your request. Please try again later.";
    }
  }
}

export const groqService = new GroqService();
