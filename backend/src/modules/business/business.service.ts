import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SaleStatus, Prisma } from '@prisma/client';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async getBusiness(businessId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: {
        _count: {
          select: {
            products: true,
            sales: true,
            purchases: true,
            members: true,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return business;
  }

  async updateBusiness(
    businessId: string,
    data: { name?: string; timezone?: string },
  ) {
    return this.prisma.business.update({
      where: { id: businessId },
      data,
    });
  }

  async listMembers(businessId: string) {
    return this.prisma.businessMember.findMany({
      where: { businessId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listCustomers(businessId: string) {
    return this.prisma.customer.findMany({
      where: { businessId, isActive: true },
      include: {
        _count: { select: { sales: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCustomer(
    businessId: string,
    data: {
      name: string;
      phone?: string;
      email?: string;
      address?: string;
      openingBalance?: number;
    },
  ) {
    return this.prisma.customer.create({
      data: {
        businessId,
        name: data.name.trim(),
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        openingBalance: new Prisma.Decimal(data.openingBalance || 0),
      },
    });
  }

  async getFinancialOverview(businessId: string) {
    // 1. Sales & Revenue
    const completedSales = await this.prisma.sale.findMany({
      where: { businessId, status: SaleStatus.COMPLETED },
      include: { items: true },
    });

    let totalRevenue = 0;
    let totalCogs = 0;
    let totalItemsSold = 0;

    for (const sale of completedSales) {
      totalRevenue += Number(sale.total);
      for (const item of sale.items) {
        totalItemsSold += Number(item.qty);
        totalCogs += Number(item.qty) * Number(item.unitCost);
      }
    }

    const grossProfit = totalRevenue - totalCogs;
    const grossMarginPct =
      totalRevenue > 0
        ? Math.round((grossProfit / totalRevenue) * 1000) / 10
        : 0;

    // 2. Inventory Valuation
    const products = await this.prisma.product.findMany({
      where: { businessId, isActive: true },
    });

    let inventoryCostValuation = 0;
    let inventoryRetailValuation = 0;
    let totalStockUnits = 0;
    let lowStockCount = 0;

    for (const p of products) {
      const qty = Number(p.stockQty);
      const cost = Number(p.costPrice);
      const selling = Number(p.sellingPrice);
      const reorder = Number(p.reorderLevel);

      totalStockUnits += qty;
      inventoryCostValuation += qty * cost;
      inventoryRetailValuation += qty * selling;
      if (qty <= reorder) {
        lowStockCount++;
      }
    }

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCogs: Math.round(totalCogs * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossMarginPct,
      completedOrdersCount: completedSales.length,
      totalItemsSold,
      inventoryCostValuation: Math.round(inventoryCostValuation * 100) / 100,
      inventoryRetailValuation: Math.round(inventoryRetailValuation * 100) / 100,
      totalStockUnits,
      totalProductCount: products.length,
      lowStockCount,
      currency: 'BDT',
    };
  }
}
