import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreatePurchaseDto,
  CreateSupplierDto,
} from './dto/purchase.dto';
import {
  MovementType,
  PaymentDirection,
  PaymentMethod,
  Prisma,
  PurchaseStatus,
} from '@prisma/client';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  // ------------------------------------------------------------- Suppliers
  async findAllSuppliers(businessId: string) {
    return this.prisma.supplier.findMany({
      where: { businessId, isActive: true },
      include: {
        _count: { select: { purchases: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createSupplier(businessId: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        businessId,
        name: dto.name.trim(),
        phone: dto.phone || null,
        email: dto.email || null,
        address: dto.address || null,
        openingBalance: new Prisma.Decimal(dto.openingBalance || 0),
      },
    });
  }

  async updateSupplier(businessId: string, id: string, dto: Partial<CreateSupplierDto>) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, businessId },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return this.prisma.supplier.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.openingBalance !== undefined && {
          openingBalance: new Prisma.Decimal(dto.openingBalance),
        }),
      },
    });
  }

  // ------------------------------------------------------------- Purchases
  async create(businessId: string, userId: string, dto: CreatePurchaseDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Purchase must contain at least one item');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Idempotency check
      if (dto.idempotencyKey) {
        const existing = await tx.purchase.findUnique({
          where: {
            businessId_idempotencyKey: {
              businessId,
              idempotencyKey: dto.idempotencyKey,
            },
          },
          include: { items: true, supplier: true },
        });
        if (existing) {
          return this.formatPurchase(existing);
        }
      }

      // 2. Fetch products
      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, businessId },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products do not exist');
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      // 3. Document sequence number (PO-0001, PO-0002)
      const counter = await tx.counter.upsert({
        where: { businessId_name: { businessId, name: 'purchase' } },
        update: { value: { increment: 1 } },
        create: { businessId, name: 'purchase', value: 1 },
      });
      const number = `PO-${counter.value.toString().padStart(4, '0')}`;

      // 4. Calculate totals
      let subtotal = 0;
      const itemsData = [];

      for (const item of dto.items) {
        const product = productMap.get(item.productId)!;
        const itemQty = item.qty ?? item.quantity ?? 1;
        const lineTotal = itemQty * item.unitCost;
        subtotal += lineTotal;

        itemsData.push({
          productId: product.id,
          nameSnapshot: product.name,
          qty: new Prisma.Decimal(itemQty),
          unitCost: new Prisma.Decimal(item.unitCost),
          lineTotal: new Prisma.Decimal(lineTotal),
        });
      }

      const discount = dto.discount ? Number(dto.discount) : 0;
      const total = Math.max(0, subtotal - discount);
      const note = dto.note || dto.notes || null;

      // 5. Create Purchase in DRAFT status (no stock changes on draft creation)
      const purchase = await tx.purchase.create({
        data: {
          businessId,
          number,
          supplierId: dto.supplierId || null,
          status: PurchaseStatus.DRAFT,
          subtotal: new Prisma.Decimal(subtotal),
          discount: new Prisma.Decimal(discount),
          total: new Prisma.Decimal(total),
          note,
          createdById: userId,
          idempotencyKey: dto.idempotencyKey || null,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
          supplier: true,
        },
      });

      return this.formatPurchase(purchase);
    });
  }

  async receive(businessId: string, userId: string, purchaseId: string) {
    return this.prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findFirst({
        where: { id: purchaseId, businessId },
        include: { items: true, supplier: true },
      });

      if (!purchase) {
        throw new NotFoundException('Purchase order not found');
      }

      if (purchase.status === PurchaseStatus.RECEIVED) {
        throw new BadRequestException('This purchase order has already been received');
      }

      if (purchase.status === PurchaseStatus.CANCELLED) {
        throw new BadRequestException('Cannot receive a cancelled purchase order');
      }

      // Mark purchase received
      const updatedPurchase = await tx.purchase.update({
        where: { id: purchaseId },
        data: {
          status: PurchaseStatus.RECEIVED,
          receivedAt: new Date(),
        },
        include: { items: true, supplier: true },
      });

      // Update inventory and calculate new moving-weighted average cost
      for (const item of purchase.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const currentStock = Number(product.stockQty);
          const currentCost = Number(product.costPrice);
          const receivedQty = Number(item.qty);
          const receivedCost = Number(item.unitCost);

          const newStock = currentStock + receivedQty;
          // Weighted average cost formula
          const newCost =
            newStock > 0
              ? (currentStock * currentCost + receivedQty * receivedCost) / newStock
              : receivedCost;

          await tx.product.update({
            where: { id: product.id },
            data: {
              stockQty: new Prisma.Decimal(newStock),
              costPrice: new Prisma.Decimal(Math.round(newCost * 100) / 100),
            },
          });

          await tx.stockMovement.create({
            data: {
              businessId,
              productId: product.id,
              type: MovementType.PURCHASE,
              quantityChange: new Prisma.Decimal(receivedQty),
              balanceAfter: new Prisma.Decimal(newStock),
              unitCost: new Prisma.Decimal(receivedCost),
              refType: 'Purchase',
              refId: purchase.id,
              note: `Goods receipt from ${purchase.number}`,
              createdById: userId,
            },
          });
        }
      }

      // Record outflow payment
      await tx.payment.create({
        data: {
          businessId,
          direction: PaymentDirection.OUT,
          supplierId: purchase.supplierId,
          purchaseId: purchase.id,
          amount: purchase.total,
          method: PaymentMethod.CASH,
          note: `Payment for received purchase ${purchase.number}`,
          createdById: userId,
        },
      });

      return this.formatPurchase(updatedPurchase);
    });
  }

  async cancel(businessId: string, _userId: string, purchaseId: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: { id: purchaseId, businessId },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase order not found');
    }

    if (purchase.status === PurchaseStatus.RECEIVED) {
      throw new BadRequestException('Cannot cancel an already received purchase order');
    }

    const updated = await this.prisma.purchase.update({
      where: { id: purchaseId },
      data: { status: PurchaseStatus.CANCELLED },
      include: { items: true, supplier: true },
    });

    return this.formatPurchase(updated);
  }

  async findAll(
    businessId: string,
    query: { page?: number; limit?: number; status?: PurchaseStatus },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseWhereInput = { businessId };
    if (query.status) {
      where.status = query.status;
    }

    const [total, purchases] = await Promise.all([
      this.prisma.purchase.count({ where }),
      this.prisma.purchase.findMany({
        where,
        include: {
          items: true,
          supplier: true,
        },
        orderBy: { orderedAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: purchases.map((p) => this.formatPurchase(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(businessId: string, id: string) {
    const purchase = await this.prisma.purchase.findFirst({
      where: { id, businessId },
      include: {
        items: true,
        supplier: true,
        payments: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase order not found');
    }

    return this.formatPurchase(purchase);
  }

   
  private formatPurchase(p: any) {
    return {
      ...p,
      subtotal: Number(p.subtotal),
      discount: Number(p.discount),
      total: Number(p.total),
       
      items: p.items?.map((item: any) => ({
        ...item,
        qty: Number(item.qty),
        unitCost: Number(item.unitCost),
        lineTotal: Number(item.lineTotal),
      })),
    };
  }
}
