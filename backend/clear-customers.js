const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearCustomers() {
  console.log('Starting database cleanup...');

  try {
    // 1. Find all customer IDs
    const customers = await prisma.user.findMany({
      where: { role: 'customer' },
      select: { id: true, email: true }
    });

    const customerIds = customers.map(c => c.id);
    console.log(`Found ${customers.length} customer account(s) to clear.`);

    if (customerIds.length === 0) {
      console.log('No customer accounts found to delete.');
      return;
    }

    // 2. Delete related SiteVisits
    const deletedVisits = await prisma.siteVisit.deleteMany({
      where: { userId: { in: customerIds } }
    });
    console.log(`Deleted ${deletedVisits.count} related site visit record(s).`);

    // 3. Find customer orders
    const orders = await prisma.order.findMany({
      where: { userId: { in: customerIds } },
      select: { id: true }
    });
    const orderIds = orders.map(o => o.id);

    if (orderIds.length > 0) {
      // 4. Delete related OrderItems
      const deletedOrderItems = await prisma.orderItem.deleteMany({
        where: { orderId: { in: orderIds } }
      });
      console.log(`Deleted ${deletedOrderItems.count} related order item(s).`);

      // 5. Delete Orders
      const deletedOrders = await prisma.order.deleteMany({
        where: { id: { in: orderIds } }
      });
      console.log(`Deleted ${deletedOrders.count} related order(s).`);
    }

    // 6. Delete the Users themselves
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: customerIds } }
    });
    console.log(`Successfully deleted ${deletedUsers.count} customer account(s) from the database.`);
    console.log('Admin accounts were left untouched.');

  } catch (error) {
    console.error('An error occurred during database cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearCustomers();
