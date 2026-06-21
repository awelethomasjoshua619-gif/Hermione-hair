// Script to delete all customer accounts (keeps admin accounts safe)
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function clearCustomers() {
  try {
    console.log('🔍 Finding all customer accounts...')

    const customers = await prisma.user.findMany({
      where: { role: 'customer' },
      select: { id: true, email: true, name: true }
    })

    if (customers.length === 0) {
      console.log('✅ No customer accounts found. Database is already clean!')
      return
    }

    console.log(`Found ${customers.length} customer account(s):`)
    customers.forEach(c => console.log(`   - ${c.name} (${c.email})`))

    // Delete related records first (orders, site visits) to avoid foreign key errors
    const customerIds = customers.map(c => c.id)

    console.log('\n🗑️  Deleting related orders and records...')
    await prisma.orderItem.deleteMany({ where: { order: { userId: { in: customerIds } } } })
    await prisma.order.deleteMany({ where: { userId: { in: customerIds } } })
    await prisma.siteVisit.deleteMany({ where: { userId: { in: customerIds } } })

    console.log('🗑️  Deleting customer accounts...')
    const result = await prisma.user.deleteMany({ where: { role: 'customer' } })

    console.log(`\n✅ Successfully deleted ${result.count} customer account(s).`)
    console.log('✅ All admin accounts are untouched and safe.')
    console.log('\n🚀 Your database is clean and ready for fresh sign-ups!')

  } catch (err) {
    console.error('❌ Error clearing customers:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

clearCustomers()
