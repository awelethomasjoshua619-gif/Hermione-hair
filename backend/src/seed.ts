import bcrypt from 'bcryptjs'
import prisma from './config/db'
import { env } from './config/env'

async function seed() {
  const salt = await bcrypt.genSalt(12)

  // Test user
  const testHash = await bcrypt.hash(env.SEED_TEST_PASSWORD, salt)
  await prisma.user.upsert({
    where: { email: env.SEED_TEST_EMAIL },
    update: { passwordHash: testHash, isVerified: true },
    create: {
      name: 'Joshua',
      email: env.SEED_TEST_EMAIL,
      passwordHash: testHash,
      role: 'customer',
      isVerified: true,
    },
  })

  // Admin user
  const adminHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, salt)
  await prisma.user.upsert({
    where: { email: env.SEED_ADMIN_EMAIL },
    update: { passwordHash: adminHash, role: 'admin', isVerified: true },
    create: {
      name: 'Admin',
      email: env.SEED_ADMIN_EMAIL,
      passwordHash: adminHash,
      role: 'admin',
      isVerified: true,
    },
  })

  console.log('[Seed] ✅ Done.')
  await prisma.$disconnect()
}

seed()