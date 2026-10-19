import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;
const testDbUrl = process.env.DATABASE_URL_TEST;

// eslint-disable-next-line no-console
console.log('--- SmartStock Database Setup ---');

if (!dbUrl) {
  // eslint-disable-next-line no-console
  console.error('Error: DATABASE_URL is not set in environment or .env');
  process.exit(1);
}

try {
  // eslint-disable-next-line no-console
  console.log('Applying migrations to main development database...');
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: dbUrl },
  });

  if (testDbUrl) {
    // eslint-disable-next-line no-console
    console.log('Applying migrations to test database (DATABASE_URL_TEST)...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: testDbUrl },
    });
  }

  // eslint-disable-next-line no-console
  console.log('Database setup complete.');
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Failed to setup databases:', error);
  process.exit(1);
}
