import { Module } from '@nestjs/common';
import { ForecastingService } from './forecasting/forecasting.service';
import { GeminiService } from './llm/gemini.service';
import { AiAdvisorService } from './ai-advisor.service';
import { AiAdvisorController } from './ai-advisor.controller';

@Module({
  controllers: [AiAdvisorController],
  providers: [ForecastingService, GeminiService, AiAdvisorService],
  exports: [AiAdvisorService, ForecastingService],
})
export class AiAdvisorModule {}
