import { Injectable } from '@nestjs/common';
import { ForecastingService, ProductForecast } from './forecasting/forecasting.service';
import { GeminiService } from './llm/gemini.service';

export interface EnrichedRecommendation extends ProductForecast {
  explanation: string;
  isAiGenerated: boolean;
  estimatedReorderCost: number;
}

@Injectable()
export class AiAdvisorService {
  constructor(
    private readonly forecastingService: ForecastingService,
    private readonly geminiService: GeminiService,
  ) {}

  async getRecommendations(
    businessId: string,
    query: { urgencyOnly?: boolean; language?: 'bn' | 'en' },
  ): Promise<EnrichedRecommendation[]> {
    const forecasts = await this.forecastingService.calculateForecast(businessId);
    const lang = query.language || 'bn';

    const targetForecasts = query.urgencyOnly
      ? forecasts.filter((f) => f.urgency === 'CRITICAL' || f.urgency === 'WARNING')
      : forecasts;

    // Sort by urgency first (CRITICAL -> WARNING -> HEALTHY)
    const priorityOrder = { CRITICAL: 0, WARNING: 1, HEALTHY: 2 };
    targetForecasts.sort(
      (a, b) => priorityOrder[a.urgency] - priorityOrder[b.urgency],
    );

    const enriched = await Promise.all(
      targetForecasts.map(async (forecast) => {
        const { explanation, isAiGenerated } =
          await this.geminiService.generateReorderExplanation(forecast, lang);

        const estimatedReorderCost =
          Math.round(forecast.recommendedOrderQty * forecast.costPrice * 100) / 100;

        return {
          ...forecast,
          explanation,
          isAiGenerated,
          estimatedReorderCost,
        };
      }),
    );

    return enriched;
  }

  async getAdvisorInsights(businessId: string) {
    const recommendations = await this.getRecommendations(businessId, {
      language: 'bn',
    });

    const criticalCount = recommendations.filter((r) => r.urgency === 'CRITICAL').length;
    const warningCount = recommendations.filter((r) => r.urgency === 'WARNING').length;
    const totalRecommendedInvestment = recommendations.reduce(
      (sum, r) => sum + r.estimatedReorderCost,
      0,
    );

    return {
      totalProductsAnalyzed: recommendations.length,
      criticalStockouts: criticalCount,
      warningsCount: warningCount,
      totalRecommendedInvestment: Math.round(totalRecommendedInvestment * 100) / 100,
      healthyCount: recommendations.length - criticalCount - warningCount,
      recommendations,
    };
  }
}
