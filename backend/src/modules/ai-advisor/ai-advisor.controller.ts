import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AiAdvisorService } from './ai-advisor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentBusiness } from '../auth/decorators/auth.decorators';

@ApiTags('AI Inventory Advisor')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai-advisor')
export class AiAdvisorController {
  constructor(private readonly aiAdvisorService: AiAdvisorService) {}

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI and deterministic reorder recommendations' })
  @ApiQuery({ name: 'urgencyOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'language', required: false, enum: ['bn', 'en'] })
  async getRecommendations(
    @CurrentBusiness() businessId: string,
    @Query('urgencyOnly') urgencyOnly?: string,
    @Query('language') language?: 'bn' | 'en',
  ) {
    return this.aiAdvisorService.getRecommendations(businessId, {
      urgencyOnly: urgencyOnly === 'true',
      language,
    });
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get aggregate inventory health and restock investment projections' })
  async getInsights(@CurrentBusiness() businessId: string) {
    return this.aiAdvisorService.getAdvisorInsights(businessId);
  }
}
