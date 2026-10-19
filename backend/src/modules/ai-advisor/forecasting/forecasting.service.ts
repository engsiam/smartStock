import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface ProductForecast {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  currentStock: number;
  costPrice: number;
  sellingPrice: number;
  leadTimeDays: number;
  dailyVelocity: number;
  daysOfSupply: number;
  leadTimeDemand: number;
  safetyStock: number;
  reorderPoint: number;
  recommendedOrderQty: number;
  urgency: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  stockoutInDays: number | null;
}

@Injectable()
export class ForecastingService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateForecast(
    businessId: string,
    productId?: string,
  ): Promise<ProductForecast[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const where = {
      businessId,
      isActive: true,
      ...(productId ? { id: productId } : {}),
    };

    const products = await this.prisma.product.findMany({
      where,
      include: {
        saleItems: {
          where: {
            sale: {
              status: 'COMPLETED',
              soldAt: { gte: thirtyDaysAgo },
            },
          },
        },
      },
    });

    return products.map((product) => {
      const currentStock = Number(product.stockQty);
      const leadTimeDays = product.leadTimeDays || 3;
      const costPrice = Number(product.costPrice);
      const sellingPrice = Number(product.sellingPrice);

      // Total sold in last 30 days
      const totalUnitsSold = product.saleItems.reduce(
        (sum, item) => sum + Number(item.qty),
        0,
      );

      // Average daily sales rate
      const dailyVelocity = Math.max(0.1, Math.round((totalUnitsSold / 30) * 100) / 100);

      // Days of supply remaining
      const daysOfSupply =
        dailyVelocity > 0
          ? Math.round((currentStock / dailyVelocity) * 10) / 10
          : 999;

      // Lead Time Demand = Daily Sales * Lead Time
      const leadTimeDemand = Math.round(dailyVelocity * leadTimeDays * 10) / 10;

      // Safety stock: 3 days of buffer demand
      const safetyStock = Math.ceil(dailyVelocity * Math.max(2, Math.round(leadTimeDays * 0.75)));

      // Reorder Point = Lead Time Demand + Safety Stock
      const reorderPoint = Math.ceil(leadTimeDemand + safetyStock);

      // Recommended Order Qty: replenish to 14 days of supply
      const targetStock = Math.ceil(dailyVelocity * 14) + safetyStock;
      const recommendedOrderQty = Math.max(
        0,
        Math.ceil(targetStock - currentStock),
      );

      // Urgency determination
      let urgency: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 'HEALTHY';
      if (currentStock <= safetyStock || currentStock <= 0) {
        urgency = 'CRITICAL';
      } else if (currentStock <= reorderPoint) {
        urgency = 'WARNING';
      }

      const stockoutInDays =
        dailyVelocity > 0 && currentStock > 0
          ? Math.floor(currentStock / dailyVelocity)
          : currentStock <= 0
            ? 0
            : null;

      return {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        unit: product.unit,
        currentStock,
        costPrice,
        sellingPrice,
        leadTimeDays,
        dailyVelocity,
        daysOfSupply,
        leadTimeDemand,
        safetyStock,
        reorderPoint,
        recommendedOrderQty,
        urgency,
        stockoutInDays,
      };
    });
  }
}
