import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../../src/modules/products/products.service';
import { PrismaService } from '../../src/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('Tenant Isolation & RBAC Scoping (Integration Logic)', () => {
  let productsService: ProductsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      product: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          // If query scopes to biz_dhaka and prod-01 belongs to biz_dhaka -> returns product
          if (where.id === 'prod-01' && where.businessId === 'biz_dhaka') {
            return Promise.resolve({
              id: 'prod-01',
              name: 'ACI Pure Salt 1kg',
              businessId: 'biz_dhaka',
              stockQty: new Prisma.Decimal(50),
              costPrice: new Prisma.Decimal(32),
              sellingPrice: new Prisma.Decimal(40),
            });
          }
          // Cross-business attempt: returns null
          return Promise.resolve(null);
        }),
        findMany: jest.fn().mockImplementation(({ where }) => {
          if (where.businessId === 'biz_dhaka') {
            return Promise.resolve([{ id: 'prod-01', businessId: 'biz_dhaka' }]);
          }
          return Promise.resolve([]);
        }),
        count: jest.fn().mockResolvedValue(1),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);
  });

  it('allows access to product when businessId matches tenant', async () => {
    const prod = await productsService.findOne('biz_dhaka', 'prod-01');
    expect(prod).toBeDefined();
    expect(prod.id).toBe('prod-01');
  });

  it('prevents IDOR and throws 404 NotFoundException when tenant B queries tenant A product', async () => {
    // biz_chittagong attempts to access prod-01 owned by biz_dhaka
    await expect(
      productsService.findOne('biz_chittagong', 'prod-01'),
    ).rejects.toThrow(NotFoundException);
  });
});
