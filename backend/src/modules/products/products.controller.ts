import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  StockAdjustmentDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  Roles,
  CurrentBusiness,
  CurrentUser,
} from '../auth/decorators/auth.decorators';
import { BusinessRole } from '@prisma/client';

@ApiTags('Products & Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products with filtering, search, and pagination' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'lowStockOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @CurrentBusiness() businessId: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('lowStockOnly') lowStockOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.findAll(businessId, {
      search,
      categoryId,
      lowStockOnly: lowStockOnly === 'true',
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('alerts/low-stock')
  @ApiOperation({ summary: 'Get products currently below their reorder threshold' })
  async getLowStockAlerts(@CurrentBusiness() businessId: string) {
    return this.productsService.getLowStockAlerts(businessId);
  }

  @Get('analytics/valuation')
  @ApiOperation({ summary: 'Get aggregate inventory valuation and margin metrics' })
  async getInventoryValuation(@CurrentBusiness() businessId: string) {
    return this.productsService.getInventoryValuation(businessId);
  }

  @Get('movements')
  @ApiOperation({ summary: 'Get stock movement audit ledger records' })
  @ApiQuery({ name: 'productId', required: false })
  async getStockMovements(
    @CurrentBusiness() businessId: string,
    @Query('productId') productId?: string,
  ) {
    return this.productsService.getStockMovements(businessId, productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  async findOne(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.productsService.findOne(businessId, id);
  }

  @Post()
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Create a new product with optional initial opening stock' })
  async create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.create(businessId, userId, dto);
  }

  @Put(':id')
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Update an existing product' })
  async update(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(businessId, id, dto);
  }

  @Post(':id/adjust-stock')
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Perform atomic manual stock increase or decrease' })
  async adjustStock(
    @CurrentBusiness() businessId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: StockAdjustmentDto,
  ) {
    return this.productsService.adjustStock(businessId, userId, id, dto);
  }
}
