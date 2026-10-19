import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  StockAdjustmentDto,
} from './dto/product.dto';
import { MovementType, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    businessId: string,
    query: {
      search?: string;
      categoryId?: string;
      lowStockOnly?: boolean;
      page?: number;
      limit?: number;
    },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      businessId,
      isActive: true,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    // Format Decimal values for JSON response
    const formatted = products.map((p) => ({
      ...p,
      sellingPrice: Number(p.sellingPrice),
      costPrice: Number(p.costPrice),
      stockQty: Number(p.stockQty),
      reorderLevel: Number(p.reorderLevel),
      isLowStock: Number(p.stockQty) <= Number(p.reorderLevel),
    }));

    const result = query.lowStockOnly
      ? formatted.filter((p) => p.isLowStock)
      : formatted;

    return {
      data: result,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(businessId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, businessId },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...product,
      sellingPrice: Number(product.sellingPrice),
      costPrice: Number(product.costPrice),
      stockQty: Number(product.stockQty),
      reorderLevel: Number(product.reorderLevel),
      isLowStock: Number(product.stockQty) <= Number(product.reorderLevel),
    };
  }

  async create(businessId: string, userId: string, dto: CreateProductDto) {
    const existingSku = await this.prisma.product.findUnique({
      where: { businessId_sku: { businessId, sku: dto.sku.trim() } },
    });

    if (existingSku) {
      throw new ConflictException(`Product with SKU "${dto.sku}" already exists`);
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          businessId,
          sku: dto.sku.trim(),
          name: dto.name.trim(),
          categoryId: dto.categoryId || null,
          unit: dto.unit || 'pcs',
          sellingPrice: new Prisma.Decimal(dto.sellingPrice),
          costPrice: new Prisma.Decimal(dto.costPrice || 0),
          stockQty: new Prisma.Decimal(dto.stockQty || 0),
          reorderLevel: new Prisma.Decimal(dto.reorderLevel || 0),
          leadTimeDays: dto.leadTimeDays || 3,
        },
        include: { category: true },
      });

      // If initial stock was provided, create OPENING stock movement
      if (dto.stockQty && dto.stockQty > 0) {
        await tx.stockMovement.create({
          data: {
            businessId,
            productId: product.id,
            type: MovementType.OPENING,
            quantityChange: new Prisma.Decimal(dto.stockQty),
            balanceAfter: new Prisma.Decimal(dto.stockQty),
            unitCost: new Prisma.Decimal(dto.costPrice || 0),
            note: 'Initial opening stock balance',
            createdById: userId,
          },
        });
      }

      return {
        ...product,
        sellingPrice: Number(product.sellingPrice),
        costPrice: Number(product.costPrice),
        stockQty: Number(product.stockQty),
        reorderLevel: Number(product.reorderLevel),
        isLowStock: Number(product.stockQty) <= Number(product.reorderLevel),
      };
    });
  }

  async update(businessId: string, id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findFirst({
      where: { id, businessId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const data: Prisma.ProductUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.categoryId !== undefined) {
      data.category = dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : { disconnect: true };
    }
    if (dto.unit !== undefined) data.unit = dto.unit;
    if (dto.sellingPrice !== undefined)
      data.sellingPrice = new Prisma.Decimal(dto.sellingPrice);
    if (dto.costPrice !== undefined)
      data.costPrice = new Prisma.Decimal(dto.costPrice);
    if (dto.reorderLevel !== undefined)
      data.reorderLevel = new Prisma.Decimal(dto.reorderLevel);
    if (dto.leadTimeDays !== undefined) data.leadTimeDays = dto.leadTimeDays;

    const updated = await this.prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    return {
      ...updated,
      sellingPrice: Number(updated.sellingPrice),
      costPrice: Number(updated.costPrice),
      stockQty: Number(updated.stockQty),
      reorderLevel: Number(updated.reorderLevel),
      isLowStock: Number(updated.stockQty) <= Number(updated.reorderLevel),
    };
  }

  async adjustStock(
    businessId: string,
    userId: string,
    productId: string,
    dto: StockAdjustmentDto,
  ) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, businessId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const currentQty = Number(product.stockQty);
    const adjustmentQty = Number(dto.quantity);
    let signedChange: number;
    let newQty: number;

    if (dto.type === 'ADJUSTMENT_IN') {
      signedChange = adjustmentQty;
      newQty = currentQty + adjustmentQty;
    } else {
      if (currentQty < adjustmentQty) {
        throw new BadRequestException(
          `Cannot reduce stock by ${adjustmentQty}. Current available stock is only ${currentQty}.`,
        );
      }
      signedChange = -adjustmentQty;
      newQty = currentQty - adjustmentQty;
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          stockQty: new Prisma.Decimal(newQty),
        },
        include: { category: true },
      });

      const movement = await tx.stockMovement.create({
        data: {
          businessId,
          productId,
          type:
            dto.type === 'ADJUSTMENT_IN'
              ? MovementType.ADJUSTMENT_IN
              : MovementType.ADJUSTMENT_OUT,
          quantityChange: new Prisma.Decimal(signedChange),
          balanceAfter: new Prisma.Decimal(newQty),
          unitCost: product.costPrice,
          note: dto.note || `Manual ${dto.type} adjustment`,
          createdById: userId,
        },
      });

      return {
        product: {
          ...updatedProduct,
          sellingPrice: Number(updatedProduct.sellingPrice),
          costPrice: Number(updatedProduct.costPrice),
          stockQty: Number(updatedProduct.stockQty),
          reorderLevel: Number(updatedProduct.reorderLevel),
          isLowStock:
            Number(updatedProduct.stockQty) <=
            Number(updatedProduct.reorderLevel),
        },
        movement: {
          ...movement,
          quantityChange: Number(movement.quantityChange),
          balanceAfter: Number(movement.balanceAfter),
          unitCost: Number(movement.unitCost),
        },
      };
    });
  }

  async getStockMovements(businessId: string, productId?: string) {
    const where: Prisma.StockMovementWhereInput = { businessId };
    if (productId) {
      where.productId = productId;
    }

    const movements = await this.prisma.stockMovement.findMany({
      where,
      include: {
        product: {
          select: { name: true, sku: true, unit: true },
        },
        createdBy: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return movements.map((m) => ({
      ...m,
      quantityChange: Number(m.quantityChange),
      balanceAfter: Number(m.balanceAfter),
      unitCost: m.unitCost ? Number(m.unitCost) : null,
    }));
  }

  async getLowStockAlerts(businessId: string) {
    const products = await this.prisma.product.findMany({
      where: { businessId, isActive: true },
      include: { category: true },
      orderBy: { stockQty: 'asc' },
    });

    return products
      .filter((p) => Number(p.stockQty) <= Number(p.reorderLevel))
      .map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category?.name || 'Uncategorized',
        stockQty: Number(p.stockQty),
        reorderLevel: Number(p.reorderLevel),
        deficit: Math.max(0, Number(p.reorderLevel) - Number(p.stockQty)),
        unit: p.unit,
        leadTimeDays: p.leadTimeDays,
      }));
  }

  async getInventoryValuation(businessId: string) {
    const products = await this.prisma.product.findMany({
      where: { businessId, isActive: true },
    });

    let totalItems = 0;
    let costValuation = 0;
    let retailValuation = 0;
    let lowStockCount = 0;

    for (const p of products) {
      const qty = Number(p.stockQty);
      const cost = Number(p.costPrice);
      const selling = Number(p.sellingPrice);
      const reorder = Number(p.reorderLevel);

      totalItems += qty;
      costValuation += qty * cost;
      retailValuation += qty * selling;
      if (qty <= reorder) {
        lowStockCount++;
      }
    }

    return {
      totalProductCount: products.length,
      totalUnitsInStock: totalItems,
      costValuation: Math.round(costValuation * 100) / 100,
      retailValuation: Math.round(retailValuation * 100) / 100,
      potentialGrossMargin:
        costValuation > 0
          ? Math.round(((retailValuation - costValuation) / retailValuation) * 1000) / 10
          : 0,
      lowStockCount,
    };
  }
}
