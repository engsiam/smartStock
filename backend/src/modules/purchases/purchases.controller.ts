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
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto, CreateSupplierDto } from './dto/purchase.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  Roles,
  CurrentBusiness,
  CurrentUser,
} from '../auth/decorators/auth.decorators';
import { BusinessRole, PurchaseStatus } from '@prisma/client';

@ApiTags('Purchasing & Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  // Suppliers
  @Get('suppliers')
  @ApiOperation({ summary: 'List all suppliers for the active business' })
  async findAllSuppliers(@CurrentBusiness() businessId: string) {
    return this.purchasesService.findAllSuppliers(businessId);
  }

  @Post('suppliers')
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Register a new supplier' })
  async createSupplier(
    @CurrentBusiness() businessId: string,
    @Body() dto: CreateSupplierDto,
  ) {
    return this.purchasesService.createSupplier(businessId, dto);
  }

  @Put('suppliers/:id')
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Update supplier details' })
  async updateSupplier(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateSupplierDto>,
  ) {
    return this.purchasesService.updateSupplier(businessId, id, dto);
  }

  // Purchases
  @Get()
  @ApiOperation({ summary: 'List purchase orders with pagination' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: PurchaseStatus })
  async findAll(
    @CurrentBusiness() businessId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PurchaseStatus,
  ) {
    return this.purchasesService.findAll(businessId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order details by ID' })
  async findOne(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.purchasesService.findOne(businessId, id);
  }

  @Post()
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Create a new purchase order in DRAFT status' })
  async create(
    @CurrentBusiness() businessId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePurchaseDto,
  ) {
    return this.purchasesService.create(businessId, userId, dto);
  }

  @Post(':id/receive')
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Receive goods, increasing inventory and updating weighted average cost' })
  async receive(
    @CurrentBusiness() businessId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.purchasesService.receive(businessId, userId, id);
  }

  @Post(':id/cancel')
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Cancel a draft purchase order' })
  async cancel(
    @CurrentBusiness() businessId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.purchasesService.cancel(businessId, userId, id);
  }
}
