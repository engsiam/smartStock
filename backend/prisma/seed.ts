import { PrismaClient, BusinessRole, MovementType } from '@prisma/client';

const prisma = new PrismaClient();

// Pre-computed Argon2id hash for dev password 'Password123!'
const DEV_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$RHsWaabZF/+qwZtGKx/FPg$fyhWwO9uyBbR1bUKBuDb/HlNKmSTWlOw+Y7FYaCcB3s';

async function main() {
  // eslint-disable-next-line no-console
  console.log('Seeding SmartStock development database...');

  // 1. Seed Users (Owner, Staff, Accountant)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@smartstock.local' },
    update: { name: 'Siam Ahmed (Owner)', passwordHash: DEV_PASSWORD_HASH },
    create: {
      email: 'owner@smartstock.local',
      name: 'Siam Ahmed (Owner)',
      passwordHash: DEV_PASSWORD_HASH,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@smartstock.local' },
    update: { name: 'Rahim Ullah (Staff)', passwordHash: DEV_PASSWORD_HASH },
    create: {
      email: 'staff@smartstock.local',
      name: 'Rahim Ullah (Staff)',
      passwordHash: DEV_PASSWORD_HASH,
    },
  });

  const accountant = await prisma.user.upsert({
    where: { email: 'accountant@smartstock.local' },
    update: { name: 'Fatema Begum (Accountant)', passwordHash: DEV_PASSWORD_HASH },
    create: {
      email: 'accountant@smartstock.local',
      name: 'Fatema Begum (Accountant)',
      passwordHash: DEV_PASSWORD_HASH,
    },
  });

  // 2. Seed Business Tenancy
  const business = await prisma.business.upsert({
    where: { id: 'biz_dhaka_grocery_01' },
    update: { name: 'Dhaka Grocery & General Store', currency: 'BDT', timezone: 'Asia/Dhaka' },
    create: {
      id: 'biz_dhaka_grocery_01',
      name: 'Dhaka Grocery & General Store',
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
    },
  });

  // 3. Seed Business Memberships
  await prisma.businessMember.upsert({
    where: { businessId_userId: { businessId: business.id, userId: owner.id } },
    update: { role: BusinessRole.OWNER },
    create: { businessId: business.id, userId: owner.id, role: BusinessRole.OWNER },
  });

  await prisma.businessMember.upsert({
    where: { businessId_userId: { businessId: business.id, userId: staff.id } },
    update: { role: BusinessRole.STAFF },
    create: { businessId: business.id, userId: staff.id, role: BusinessRole.STAFF },
  });

  await prisma.businessMember.upsert({
    where: { businessId_userId: { businessId: business.id, userId: accountant.id } },
    update: { role: BusinessRole.ACCOUNTANT },
    create: { businessId: business.id, userId: accountant.id, role: BusinessRole.ACCOUNTANT },
  });

  // 4. Seed Categories
  const catTea = await prisma.category.upsert({
    where: { businessId_name: { businessId: business.id, name: 'Beverages & Tea' } },
    update: {},
    create: { businessId: business.id, name: 'Beverages & Tea' },
  });

  const catGrains = await prisma.category.upsert({
    where: { businessId_name: { businessId: business.id, name: 'Rice & Grains' } },
    update: {},
    create: { businessId: business.id, name: 'Rice & Grains' },
  });

  const catOils = await prisma.category.upsert({
    where: { businessId_name: { businessId: business.id, name: 'Cooking Oil & Spices' } },
    update: {},
    create: { businessId: business.id, name: 'Cooking Oil & Spices' },
  });

  // 5. Seed Suppliers
  await prisma.supplier.upsert({
    where: { id: 'sup_city_group_01' },
    update: { name: 'City Group Distribution Ltd.' },
    create: {
      id: 'sup_city_group_01',
      businessId: business.id,
      name: 'City Group Distribution Ltd.',
      phone: '+8801711000001',
      email: 'sales@citygroup.bd',
      address: 'Kawran Bazar, Dhaka',
      openingBalance: 15000.0,
    },
  });

  await prisma.supplier.upsert({
    where: { id: 'sup_meghna_01' },
    update: { name: 'Meghna Group of Industries' },
    create: {
      id: 'sup_meghna_01',
      businessId: business.id,
      name: 'Meghna Group of Industries',
      phone: '+8801811000002',
      email: 'order@mgi.org',
      address: 'Motijheel C/A, Dhaka',
      openingBalance: 0.0,
    },
  });

  // 6. Seed Customers
  await prisma.customer.upsert({
    where: { id: 'cust_alamin_01' },
    update: { name: 'Al-Amin General Store (B2B)' },
    create: {
      id: 'cust_alamin_01',
      businessId: business.id,
      name: 'Al-Amin General Store (B2B)',
      phone: '+8801911000003',
      email: 'alamin.store@gmail.com',
      address: 'Mirpur-10, Dhaka',
      openingBalance: 4500.0,
    },
  });

  await prisma.customer.upsert({
    where: { id: 'cust_walkin_01' },
    update: { name: 'Walk-in Retail Customer' },
    create: {
      id: 'cust_walkin_01',
      businessId: business.id,
      name: 'Walk-in Retail Customer',
      openingBalance: 0.0,
    },
  });

  // 7. Seed Products with realistic Bangladeshi pricing
  const productsData = [
    {
      sku: 'TEA-ISP-400G',
      name: 'Ispahani Mirzapore Tea 400g',
      categoryId: catTea.id,
      unit: 'pcs',
      sellingPrice: 240.0,
      costPrice: 210.0,
      stockQty: 50.0,
      reorderLevel: 15.0,
      leadTimeDays: 2,
    },
    {
      sku: 'RICE-MIN-25KG',
      name: 'Miniket Premium Rice 25kg',
      categoryId: catGrains.id,
      unit: 'bag',
      sellingPrice: 1850.0,
      costPrice: 1650.0,
      stockQty: 25.0,
      reorderLevel: 5.0,
      leadTimeDays: 3,
    },
    {
      sku: 'OIL-TEER-5L',
      name: 'Teer Fortified Soybean Oil 5L',
      categoryId: catOils.id,
      unit: 'bottle',
      sellingPrice: 840.0,
      costPrice: 780.5,
      stockQty: 30.0,
      reorderLevel: 10.0,
      leadTimeDays: 2,
    },
    {
      sku: 'SPICE-TUR-200G',
      name: 'Radhuni Turmeric Powder 200g',
      categoryId: catOils.id,
      unit: 'pcs',
      sellingPrice: 105.0,
      costPrice: 85.0,
      stockQty: 8.0, // Low stock on purpose to test reorder alerts
      reorderLevel: 12.0,
      leadTimeDays: 4,
    },
  ];

  for (const item of productsData) {
    const product = await prisma.product.upsert({
      where: { businessId_sku: { businessId: business.id, sku: item.sku } },
      update: {
        name: item.name,
        categoryId: item.categoryId,
        unit: item.unit,
        sellingPrice: item.sellingPrice,
        costPrice: item.costPrice,
        stockQty: item.stockQty,
        reorderLevel: item.reorderLevel,
        leadTimeDays: item.leadTimeDays,
      },
      create: {
        businessId: business.id,
        sku: item.sku,
        name: item.name,
        categoryId: item.categoryId,
        unit: item.unit,
        sellingPrice: item.sellingPrice,
        costPrice: item.costPrice,
        stockQty: item.stockQty,
        reorderLevel: item.reorderLevel,
        leadTimeDays: item.leadTimeDays,
      },
    });

    // Ensure an initial opening stock movement exists
    const existingMovement = await prisma.stockMovement.findFirst({
      where: {
        businessId: business.id,
        productId: product.id,
        type: MovementType.OPENING,
      },
    });

    if (!existingMovement) {
      await prisma.stockMovement.create({
        data: {
          businessId: business.id,
          productId: product.id,
          type: MovementType.OPENING,
          quantityChange: item.stockQty,
          balanceAfter: item.stockQty,
          unitCost: item.costPrice,
          note: 'Initial opening stock balance',
          createdById: owner.id,
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('✅ Seeding completed successfully and repeatably.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
