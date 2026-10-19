import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from '../../src/modules/sales/sales.service';
import { PrismaService } from '../../src/database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('Sales Atomicity & Invariants (Integration Logic)', () => {
  let salesService: SalesService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      $transaction: jest.fn(async (cb) => {
        return cb(mockPrisma);
      }),
      sale: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => ({
          id: 'sale-test-01',
          number: 'INV-0001',
          ...data,
          items: data.items.create,
        })),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      product: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'prod-rice-25kg',
            name: 'Miniket Rice 25kg',
            businessId: 'biz_01',
            stockQty: new Prisma.Decimal(10), // Only 10 available
            costPrice: new Prisma.Decimal(1800),
            unit: 'bag',
          },
        ]),
        update: jest.fn(),
        findUnique: jest.fn(),
      },
      counter: {
        upsert: jest.fn().mockResolvedValue({ value: 1 }),
      },
      stockMovement: {
        create: jest.fn(),
      },
      payment: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    salesService = module.get<SalesService>(SalesService);
  });

  it('rejects sale with 400 when line item quantity exceeds available stock and updates nothing', async () => {
    await expect(
      salesService.create('biz_01', 'user_01', {
        items: [
          {
            productId: 'prod-rice-25kg',
            qty: 15, // Requesting 15 when only 10 in stock
            unitPrice: 2100,
          },
        ],
      }),
    ).rejects.toThrow(BadRequestException);

    // Verify atomic failure: no sale created, no stock updated, no payment created
    expect(mockPrisma.sale.create).not.toHaveBeenCalled();
    expect(mockPrisma.product.update).not.toHaveBeenCalled();
    expect(mockPrisma.stockMovement.create).not.toHaveBeenCalled();
    expect(mockPrisma.payment.create).not.toHaveBeenCalled();
  });

  it('atomically reduces stock, snapshots unitCost, and creates StockMovement when stock is sufficient', async () => {
    const result = await salesService.create('biz_01', 'user_01', {
      items: [
        {
          productId: 'prod-rice-25kg',
          qty: 4, // 4 units (<= 10)
          unitPrice: 2100,
        },
      ],
      paymentMethod: 'BKASH',
      paidAmount: 8400,
    });

    expect(result.number).toBe('INV-0001');
    expect(mockPrisma.sale.create).toHaveBeenCalled();
    // Product stock decreased: 10 - 4 = 6
    expect(mockPrisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'prod-rice-25kg' },
        data: { stockQty: new Prisma.Decimal(6) },
      }),
    );
    // Stock movement audit created with SALE type
    expect(mockPrisma.stockMovement.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'SALE',
          quantityChange: new Prisma.Decimal(-4),
          balanceAfter: new Prisma.Decimal(6),
          unitCost: new Prisma.Decimal(1800), // Snapshotted cost
        }),
      }),
    );
    // Inflow payment created
    expect(mockPrisma.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          direction: 'IN',
          amount: new Prisma.Decimal(8400),
          method: 'BKASH',
        }),
      }),
    );
  });
});
