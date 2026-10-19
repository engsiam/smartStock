import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  Roles,
  CurrentBusiness,
  CurrentUser,
} from '../auth/decorators/auth.decorators';
import { BusinessRole, SaleStatus } from '@prisma/client';

@ApiTags('Sales & POS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'List sales invoices with status filter and pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: SaleStatus })
  async findAll(
    @CurrentBusiness() businessId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: SaleStatus,
  ) {
    return this.salesService.findAll(businessId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
    });
  }

  @Get('summary/today')
  @ApiOperation({ summary: 'Get live daily sales summary, revenue, and gross profit' })
  async getDailySalesSummary(@CurrentBusiness() businessId: string) {
    return this.salesService.getDailySalesSummary(businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice details by ID' })
  async findOne(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.salesService.findOne(businessId, id);
  }

  @Post()
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Record a new sale, atomically deducting inventory' })
  async create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSaleDto,
  ) {
    return this.salesService.create(businessId, userId, dto);
  }

  @Post(':id/void')
  @Roles(BusinessRole.OWNER)
  @ApiOperation({ summary: 'Void a completed sale, returning items back to inventory' })
  async voidSale(
    @CurrentBusiness() businessId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.salesService.voidSale(businessId, userId, id);
  }
}
