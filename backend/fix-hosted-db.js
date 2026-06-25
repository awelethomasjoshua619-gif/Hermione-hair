/**
 * fix-hosted-db.js
 * Run this once to fix the herbal shampoo image on the hosted Render database.
 * Usage: node fix-hosted-db.js
 */

const { PrismaClient } = require('@prisma/client')

// Override DATABASE_URL to point at the hosted Render DB
process.env.DATABASE_URL =
  'postgresql://hermionehair_db_user:dqGWjnSlc0VszS7cN13Yr1uymx6SSNPi@dpg-d8s4srb6sc1c73c1ru30-a.oregon-postgres.render.com/hermionehair_db'

const prisma = new PrismaClient()

async function main() {
  console.log('Connecting to hosted Render database...')

  // Fix herbal shampoo image
  const shampooResult = await prisma.product.updateMany({
    where: { slug: 'herbal-shampoo' },
    data: { images: ['shampoo-herbal-cleanse.png'] },
  })
  console.log(`✅ Herbal Shampoo updated: ${shampooResult.count} row(s) affected`)

  // Also fix hair growth cream just in case
  const creamResult = await prisma.product.updateMany({
    where: { slug: 'hair-growth-cream' },
    data: { images: ['herbal-growth-cream.png'] },
  })
  console.log(`✅ Hair Growth Cream updated: ${creamResult.count} row(s) affected`)

  // Print all products and their images so you can verify
  const products = await prisma.product.findMany({
    select: { slug: true, name: true, images: true },
    orderBy: { createdAt: 'asc' },
  })
  console.log('\nAll products in hosted DB:')
  products.forEach((p) => {
    console.log(`  ${p.name} (${p.slug}): ${JSON.stringify(p.images)}`)
  })
}

main()
  .catch((e) => {
    console.error('Error:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
