import { Test, TestingModule } from '@nestjs/testing';
import { ForecastingService } from '../../src/modules/ai-advisor/forecasting/forecasting.service';
import { PrismaService } from '../../src/database/prisma.service';
import { Prisma } from '@prisma/client';

describe('ForecastingService', () => {
  let service: ForecastingService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForecastingService,
        {
          provide: PrismaService,
          useValue: {
            product: {
              findMany: jest.fn().mockResolvedValue([
                {
                  id: 'prod-1',
                  sku: 'TEA-ISP-400G',
                  name: 'Ispahani Tea',
                  unit: 'pcs',
                  stockQty: new Prisma.Decimal(5),
                  costPrice: new Prisma.Decimal(210),
                  sellingPrice: new Prisma.Decimal(240),
                  reorderLevel: new Prisma.Decimal(15),
                  leadTimeDays: 2,
                  saleItems: [
                    { qty: new Prisma.Decimal(30) },
                    { qty: new Prisma.Decimal(30) },
                  ],
                },
              ]),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ForecastingService>(ForecastingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('calculates deterministic velocity, lead time demand, and reorder point', async () => {
    const forecasts = await service.calculateForecast('test-biz');

    expect(forecasts).toHaveLength(1);
    const f = forecasts[0];
    expect(f.productId).toBe('prod-1');
    expect(f.currentStock).toBe(5);
    // 60 units sold / 30 days = 2.0 velocity
    expect(f.dailyVelocity).toBe(2.0);
    // Lead time 2 days * 2.0 = 4.0 lead time demand
    expect(f.leadTimeDemand).toBe(4.0);
    // Reorder point > 5 so urgency is WARNING (current stock 5 is > safety stock 4 and <= reorder point 8)
    expect(f.reorderPoint).toBeGreaterThanOrEqual(5);
    expect(f.urgency).toBe('WARNING');
    expect(f.recommendedOrderQty).toBeGreaterThan(0);
  });
});
