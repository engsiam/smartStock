import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const businesses = await prisma.business.count();
  const members = await prisma.businessMember.count();
  const categories = await prisma.category.count();
  const products = await prisma.product.count();
  const suppliers = await prisma.supplier.count();
  const customers = await prisma.customer.count();
  const movements = await prisma.stockMovement.count();

  // eslint-disable-next-line no-console
  console.log('--- Seeded Database Audit ---');
  // eslint-disable-next-line no-console
  console.log(`- Users: ${users}`);
  // eslint-disable-next-line no-console
  console.log(`- Businesses: ${businesses}`);
  // eslint-disable-next-line no-console
  console.log(`- Business Members: ${members}`);
  // eslint-disable-next-line no-console
  console.log(`- Categories: ${categories}`);
  // eslint-disable-next-line no-console
  console.log(`- Products: ${products}`);
  // eslint-disable-next-line no-console
  console.log(`- Suppliers: ${suppliers}`);
  // eslint-disable-next-line no-console
  console.log(`- Customers: ${customers}`);
  // eslint-disable-next-line no-console
  console.log(`- Stock Movements: ${movements}`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
