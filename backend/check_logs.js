const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const logs = await prisma.adminLoginLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 10
  })
  console.log('--- ADMIN LOGIN LOGS ---')
  console.dir(logs, { depth: null })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
