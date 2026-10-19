import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSaleDto } from './dto/sale.dto';
import { MovementType, PaymentDirection, PaymentMethod, Prisma, SaleStatus } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(businessId: string, userId: string, dto: CreateSaleDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Sale must contain at least one line item');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Idempotency check if key provided
      if (dto.idempotencyKey) {
        const existing = await tx.sale.findUnique({
          where: {
            businessId_idempotencyKey: {
              businessId,
              idempotencyKey: dto.idempotencyKey,
            },
          },
          include: { items: true, customer: true },
        });
        if (existing) {
          return this.formatSale(existing);
        }
      }

      // 2. Fetch and lock products, verify stock availability
      const productIds = dto.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, businessId },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products in this sale do not exist');
      }

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Check stock sufficiency
      for (const item of dto.items) {
        const product = productMap.get(item.productId)!;
        const available = Number(product.stockQty);
        const itemQty = item.qty ?? item.quantity ?? 1;
        if (available < itemQty) {
          throw new BadRequestException(
            `Insufficient stock for "${product.name}". Requested: ${itemQty}, Available: ${available} ${product.unit}`,
          );
        }
      }

      // 3. Generate sequential invoice number (INV-0001, INV-0002)
      const counter = await tx.counter.upsert({
        where: { businessId_name: { businessId, name: 'invoice' } },
        update: { value: { increment: 1 } },
        create: { businessId, name: 'invoice', value: 1 },
      });
      const number = `INV-${counter.value.toString().padStart(4, '0')}`;

      // 4. Calculate subtotal and total
      let subtotal = 0;
      const saleItemsData = [];

      for (const item of dto.items) {
        const product = productMap.get(item.productId)!;
        const itemQty = item.qty ?? item.quantity ?? 1;
        const lineTotal = itemQty * item.unitPrice;
        subtotal += lineTotal;

        saleItemsData.push({
          productId: product.id,
          nameSnapshot: product.name,
          qty: new Prisma.Decimal(itemQty),
          unitPrice: new Prisma.Decimal(item.unitPrice),
          unitCost: product.costPrice, // Historical cost snapshot
          lineTotal: new Prisma.Decimal(lineTotal),
        });
      }

      const discount = dto.discount ? Number(dto.discount) : 0;
      const total = Math.max(0, subtotal - discount);
      const note = dto.note || dto.notes || null;

      // 5. Create Sale
      const sale = await tx.sale.create({
        data: {
          businessId,
          number,
          customerId: dto.customerId || null,
          status: SaleStatus.COMPLETED,
          subtotal: new Prisma.Decimal(subtotal),
          discount: new Prisma.Decimal(discount),
          total: new Prisma.Decimal(total),
          note,
          createdById: userId,
          idempotencyKey: dto.idempotencyKey || null,
          items: {
            create: saleItemsData,
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      // 6. Deduct stock and record StockMovement for each product
      for (const item of dto.items) {
        const product = productMap.get(item.productId)!;
        const itemQty = item.qty ?? item.quantity ?? 1;
        const newBalance = Number(product.stockQty) - itemQty;

        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQty: new Prisma.Decimal(newBalance),
          },
        });

        await tx.stockMovement.create({
          data: {
            businessId,
            productId: product.id,
            type: MovementType.SALE,
            quantityChange: new Prisma.Decimal(-itemQty),
            balanceAfter: new Prisma.Decimal(newBalance),
            unitCost: product.costPrice,
            refType: 'Sale',
            refId: sale.id,
            note: `Sold on invoice ${number}`,
            createdById: userId,
          },
        });
      }

      // 7. Record payment receipt
      const paidAmount = dto.paidAmount !== undefined 
        ? Number(dto.paidAmount) 
        : dto.amountPaid !== undefined 
        ? Number(dto.amountPaid) 
        : total;
      if (paidAmount > 0) {
        await tx.payment.create({
          data: {
            businessId,
            direction: PaymentDirection.IN,
            customerId: dto.customerId || null,
            saleId: sale.id,
            amount: new Prisma.Decimal(paidAmount),
            method: (dto.paymentMethod as PaymentMethod) || PaymentMethod.CASH,
            note: `Payment for ${number}`,
            createdById: userId,
          },
        });
      }

      return this.formatSale(sale);
    });
  }

  async voidSale(businessId: string, userId: string, saleId: string) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({
        where: { id: saleId, businessId },
        include: { items: true },
      });

      if (!sale) {
        throw new NotFoundException('Sale record not found');
      }

      if (sale.status === SaleStatus.VOIDED) {
        throw new BadRequestException('This sale has already been voided');
      }

      // Mark sale voided
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          status: SaleStatus.VOIDED,
          voidedAt: new Date(),
        },
        include: { items: true, customer: true },
      });

      // Compensating stock restoration
      for (const item of sale.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (product) {
          const qtyToRestore = Number(item.qty);
          const newBalance = Number(product.stockQty) + qtyToRestore;

          await tx.product.update({
            where: { id: product.id },
            data: {
              stockQty: new Prisma.Decimal(newBalance),
            },
          });

          await tx.stockMovement.create({
            data: {
              businessId,
              productId: product.id,
              type: MovementType.SALE_RETURN,
              quantityChange: new Prisma.Decimal(qtyToRestore),
              balanceAfter: new Prisma.Decimal(newBalance),
              unitCost: item.unitCost,
              refType: 'Sale',
              refId: sale.id,
              note: `Void reversal for ${sale.number}`,
              createdById: userId,
            },
          });
        }
      }

      return this.formatSale(updatedSale);
    });
  }

  async findAll(
    businessId: string,
    query: { page?: number; limit?: number; status?: SaleStatus },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SaleWhereInput = { businessId };
    if (query.status) {
      where.status = query.status;
    }

    const [total, sales] = await Promise.all([
      this.prisma.sale.count({ where }),
      this.prisma.sale.findMany({
        where,
        include: {
          items: true,
          customer: true,
        },
        orderBy: { soldAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: sales.map((s) => this.formatSale(s)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(businessId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, businessId },
      include: {
        items: true,
        customer: true,
        payments: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Sale not found');
    }

    return this.formatSale(sale);
  }

  async getDailySalesSummary(businessId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedSales = await this.prisma.sale.findMany({
      where: {
        businessId,
        status: SaleStatus.COMPLETED,
        soldAt: { gte: today },
      },
      include: { items: true },
    });

    let todayRevenue = 0;
    let todayCogs = 0;
    let totalItemsSold = 0;

    for (const sale of completedSales) {
      todayRevenue += Number(sale.total);
      for (const item of sale.items) {
        totalItemsSold += Number(item.qty);
        todayCogs += Number(item.qty) * Number(item.unitCost);
      }
    }

    const grossProfit = todayRevenue - todayCogs;

    return {
      date: today.toISOString().split('T')[0],
      transactionCount: completedSales.length,
      totalRevenue: Math.round(todayRevenue * 100) / 100,
      totalCogs: Math.round(todayCogs * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossMarginPct:
        todayRevenue > 0
          ? Math.round((grossProfit / todayRevenue) * 1000) / 10
          : 0,
      totalItemsSold,
    };
  }

   
  private formatSale(sale: any) {
    return {
      ...sale,
      subtotal: Number(sale.subtotal),
      discount: Number(sale.discount),
      total: Number(sale.total),
       
      items: sale.items?.map((item: any) => ({
        ...item,
        qty: Number(item.qty),
        unitPrice: Number(item.unitPrice),
        unitCost: Number(item.unitCost),
        lineTotal: Number(item.lineTotal),
      })),
    };
  }
}
