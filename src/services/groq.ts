
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
  private systemPrompt = 'You are a helpful financial assistant. You provide advice on budgeting, savings, investments, and general financial planning. Your responses should be concise, practical, and tailored to the user\'s financial situation. Include specific numbers and percentages when possible to make your advice more concrete.';

  constructor() {
    // For demo purposes, we're using a hardcoded API key
    // In production, this should be stored securely
    this.apiKey = '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';
  }

  public formatChatHistory(history: ChatMessage[]): GroqMessage[] {
    // Start with system message
    const formattedMessages: GroqMessage[] = [
      {
        role: 'system',
        content: this.systemPrompt
      }
    ];
    
    // Add conversation history
    history.forEach(message => {
      formattedMessages.push({
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.content
      });
    });
    
    return formattedMessages;
  }

  public async getChatCompletion(messages: GroqMessage[]): Promise<string> {
    try {
      if (!this.apiKey) {
        console.warn('Groq API key not available, returning fallback response');
        return "I'm sorry, I can't process your request right now. The AI service is not properly configured.";
      }

      console.log('Sending request to Groq API:', { model: this.model, messages });

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
      console.log('Groq API response:', data);
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error getting chat completion:', error);
      return "I'm sorry, there was an error processing your request. Please try again later.";
    }
  }
}

export const groqService = new GroqService();
