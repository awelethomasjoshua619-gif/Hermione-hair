const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      createdAt: true
    }
  })
  console.log('--- USERS IN DATABASE ---')
  console.dir(users, { depth: null })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
