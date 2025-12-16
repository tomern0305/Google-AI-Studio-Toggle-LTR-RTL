import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GeminiModel } from "../types";

// Ensure API key is available
const API_KEY = process.env.API_KEY || '';

class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;
  private model: string = GeminiModel.FLASH;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  public setModel(model: string) {
    this.model = model;
    this.chatSession = null; // Reset chat when model changes
  }

  private getChatSession(): Chat {
    if (!this.chatSession) {
      this.chatSession = this.ai.chats.create({
        model: this.model,
        config: {
          systemInstruction: "You are a helpful AI assistant. You are capable of communicating fluently in Hebrew and English. When the user speaks Hebrew, reply in Hebrew. When they speak English, reply in English.",
        },
      });
    }
    return this.chatSession;
  }

  public async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    if (!API_KEY) {
      throw new Error("API Key is missing. Please check your environment variables.");
    }

    const chat = this.getChatSession();
    
    try {
      const result = await chat.sendMessageStream({ message });
      
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }

  public resetChat() {
    this.chatSession = null;
  }
}

export const geminiService = new GeminiService();