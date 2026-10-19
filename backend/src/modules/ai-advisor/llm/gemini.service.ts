import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ProductForecast } from '../forecasting/forecasting.service';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly aiClient: GoogleGenAI | null = null;
  private readonly modelName: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY', '').trim();
    this.modelName = this.configService.get<string>('GEMINI_MODEL', 'gemini-2.5-flash');
    this.timeoutMs = this.configService.get<number>('GEMINI_TIMEOUT_MS', 10000);

    if (apiKey) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey });
        this.logger.log(`Gemini AI service initialized with model: ${this.modelName}`);
      } catch (err) {
        this.logger.warn(`Failed to initialize GoogleGenAI client: ${(err as Error).message}`);
        this.aiClient = null;
      }
    } else {
      this.logger.log('GEMINI_API_KEY is empty. Using deterministic rule-based advice fallback.');
    }
  }

  async generateReorderExplanation(
    forecast: ProductForecast,
    language: 'bn' | 'en' = 'bn',
  ): Promise<{ explanation: string; isAiGenerated: boolean }> {
    if (!this.aiClient) {
      return {
        explanation: this.getDeterministicFallback(forecast, language),
        isAiGenerated: false,
      };
    }

    try {
      const prompt = `
Act as an expert retail inventory advisor for a small grocery and general store in Bangladesh.
Generate a concise, 2-sentence actionable reorder advice in ${language === 'bn' ? 'Bangla (বাংলা)' : 'English'}.

Product Details:
- Name: "${forecast.name}"
- Current Stock: ${forecast.currentStock} ${forecast.unit}
- Daily Sales Velocity: ${forecast.dailyVelocity} ${forecast.unit}/day
- Days of Supply Remaining: ${forecast.daysOfSupply} days
- Supplier Lead Time: ${forecast.leadTimeDays} days
- Recommended Order Quantity: ${forecast.recommendedOrderQty} ${forecast.unit}
- Urgency: ${forecast.urgency}

Keep tone professional and helpful. Focus on avoiding stockout and preserving working capital. Do not use markdown headers.
`.trim();

      // Call Gemini API with timeout protection
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), this.timeoutMs),
      );

      const apiCall = this.aiClient.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });

      const response = await Promise.race([apiCall, timeoutPromise]);
      const text = response.text ? response.text.trim() : '';

      if (text) {
        return { explanation: text, isAiGenerated: true };
      }
    } catch (error) {
      this.logger.warn(
        `Gemini API call failed for ${forecast.name}: ${(error as Error).message}. Falling back to deterministic message.`,
      );
    }

    return {
      explanation: this.getDeterministicFallback(forecast, language),
      isAiGenerated: false,
    };
  }

  private getDeterministicFallback(
    forecast: ProductForecast,
    language: 'bn' | 'en',
  ): string {
    if (language === 'bn') {
      if (forecast.urgency === 'CRITICAL') {
        return `সতর্কতা: "${forecast.name}" এর বর্তমান মজুদ (${forecast.currentStock} ${forecast.unit}) অত্যন্ত কম। স্টক ফুরিয়ে যাওয়ার ঝুঁকি এড়াতে অবিলম্বে ${forecast.recommendedOrderQty} ${forecast.unit} অর্ডার করুন।`;
      }
      if (forecast.urgency === 'WARNING') {
        return `পরামর্শ: "${forecast.name}" এর মজুদ রিঅর্ডার সীমার (${forecast.reorderPoint} ${forecast.unit}) নিচে। সরবরাহকারী পৌঁছাতে ${forecast.leadTimeDays} দিন লাগবে, তাই ${forecast.recommendedOrderQty} ${forecast.unit} কেনার প্রস্তুতি নিন।`;
      }
      return `মজুদ স্থিতিশীল: "${forecast.name}" এর বর্তমান মজুদ সন্তোষজনক (প্রায় ${forecast.daysOfSupply} দিনের চাহিদা পূরণে সক্ষম)। এখনই অর্ডার করার প্রয়োজন নেই।`;
    }

    if (forecast.urgency === 'CRITICAL') {
      return `Critical Stockout Alert: "${forecast.name}" has only ${forecast.currentStock} ${forecast.unit} remaining. Immediately reorder ${forecast.recommendedOrderQty} ${forecast.unit} to avoid disruption.`;
    }
    if (forecast.urgency === 'WARNING') {
      return `Reorder Advisory: "${forecast.name}" is near its reorder point of ${forecast.reorderPoint} ${forecast.unit}. Order ${forecast.recommendedOrderQty} ${forecast.unit} to cover the ${forecast.leadTimeDays}-day lead time.`;
    }
    return `Stock Healthy: "${forecast.name}" has sufficient inventory for approximately ${forecast.daysOfSupply} days. No reorder required at this time.`;
  }
}
