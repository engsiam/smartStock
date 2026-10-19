import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentBusiness } from '../auth/decorators/auth.decorators';
import { BusinessRole } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class UpdateBusinessDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}

class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

@ApiTags('Business Tenancy & Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get active business details' })
  async getCurrent(@CurrentBusiness() businessId: string) {
    return this.businessService.getBusiness(businessId);
  }

  @Put('current')
  @Roles(BusinessRole.OWNER)
  @ApiOperation({ summary: 'Update business profile details' })
  async updateCurrent(
    @CurrentBusiness() businessId: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.businessService.updateBusiness(businessId, dto);
  }

  @Get('financial-overview')
  @ApiOperation({ summary: 'Get total revenue, COGS, gross profit, and stock valuation' })
  async getFinancialOverview(@CurrentBusiness() businessId: string) {
    return this.businessService.getFinancialOverview(businessId);
  }

  @Get('members')
  @ApiOperation({ summary: 'List all team members and roles for this business' })
  async listMembers(@CurrentBusiness() businessId: string) {
    return this.businessService.listMembers(businessId);
  }

  @Get('customers')
  @ApiOperation({ summary: 'List customer accounts for this business' })
  async listCustomers(@CurrentBusiness() businessId: string) {
    return this.businessService.listCustomers(businessId);
  }

  @Post('customers')
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Register a new customer' })
  async createCustomer(
    @CurrentBusiness() businessId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.businessService.createCustomer(businessId, dto);
  }
}
