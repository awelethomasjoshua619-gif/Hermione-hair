import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import { env } from '../src/config/env'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Seed Products
  const productsData = [
    {
      name: 'Herbal Shampoo',
      slug: 'herbal-shampoo',
      description: 'A gentle yet effective cleanser formulated with botanical ingredients to remove buildup, excess oil, and impurities while supporting a healthy scalp environment for stronger, healthier hair.',
      functionTag: 'Cleanse',
      price: 6500,
      stockQuantity: 50,
      images: ['shampoo-herbal-cleanse.png'],
      tags: ['shampoo', 'cleanse', 'herbal'],
    },
    {
      name: 'Edge Growth Cream',
      slug: 'edge-growth-cream',
      description: 'A targeted formula designed to nourish fragile edges, reduce breakage, and support the appearance of fuller, healthier-looking hairlines.',
      functionTag: 'Nourish',
      price: 5000,
      stockQuantity: 40,
      images: ['edge-growth-cream.png'],
      tags: ['cream', 'edges', 'growth', 'bestseller'],
    },
    {
      name: 'Root Revival Ayurvedic Hair Oil',
      slug: 'root-revival-ayurvedic-hair-oil',
      description: 'A carefully crafted blend of Ayurvedic herbs and nourishing oils designed to support scalp health, strengthen roots, and encourage healthier hair growth.',
      functionTag: 'Protect',
      price: 7000,
      stockQuantity: 30,
      images: ['root-revival-oil.png'],
      tags: ['oil', 'ayurvedic', 'growth', 'roots'],
    },
    {
      name: 'Velvet Curls Conditioner',
      slug: 'velvet-curls-conditioner',
      description: 'A moisturizing conditioner designed to soften, detangle, and improve manageability while helping to reduce breakage and enhance curl definition.',
      functionTag: 'Nourish',
      price: 6500,
      stockQuantity: 45,
      images: ['conditioner-velvet-curls.png'],
      tags: ['conditioner', 'curls', 'moisture'],
    },
    {
      name: 'Pure Moisture Leave-In Conditioner',
      slug: 'pure-moisture-leave-in-conditioner',
      description: 'A lightweight leave-in treatment that delivers lasting hydration, improves softness, and helps keep hair manageable, smooth, and protected throughout the day.',
      functionTag: 'Nourish',
      price: 6500,
      stockQuantity: 35,
      images: ['leave-in-conditioner.png'],
      tags: ['leave-in', 'conditioner', 'moisture'],
    },
    {
      name: 'Royal Soft Hair Butter',
      slug: 'royal-soft-hair-butter',
      description: 'A rich blend of nourishing butters and oils that helps seal in moisture, soften strands, and restore dry, dull hair without weighing it down.',
      functionTag: 'Nourish',
      price: 6500,
      stockQuantity: 25,
      images: ['hair-butter.png'],
      tags: ['butter', 'moisture', 'shea'],
    },
    {
      name: 'Hair Growth Cream',
      slug: 'hair-growth-cream',
      description: 'A nutrient-rich hair cream formulated to moisturize, strengthen, and support healthy hair growth while reducing dryness and breakage.',
      functionTag: 'Nourish',
      price: 6000,
      stockQuantity: 50,
      images: ['herbal-growth-cream.png'],
      tags: ['cream', 'growth', 'moisture'],
    },
    {
      name: 'Deep Conditioner',
      slug: 'deep-conditioner',
      description: 'An intensive treatment designed to deeply nourish, strengthen, and restore moisture to dry, damaged, or brittle hair for improved elasticity and shine.',
      functionTag: 'Nourish',
      price: 8500,
      stockQuantity: 20,
      images: ['deep-conditioner.png'],
      tags: ['conditioner', 'deep', 'treatment'],
    },
    {
      name: 'Detangling Spray',
      slug: 'detangling-spray',
      description: 'A lightweight detangling spray that helps reduce knots, improve slip, and make styling easier while providing hydration and softness.',
      functionTag: 'Nourish',
      price: 7000,
      stockQuantity: 60,
      images: ['tangle-tamer.png'],
      tags: ['spray', 'detangle', 'tangle'],
    },
    {
      name: 'Hydra Root Therapy Anti-Dandruff Cream',
      slug: 'hydra-root-therapy-anti-dandruff-cream',
      description: 'A soothing scalp treatment formulated to help relieve dryness, itching, flakes, and scalp discomfort while promoting a healthier scalp environment.',
      functionTag: 'Nourish',
      price: 8000,
      stockQuantity: 15,
      images: ['anti-dandruff-cream.png'],
      tags: ['cream', 'anti-dandruff', 'scalp', 'dandruff'],
    },
    {
      name: 'Beard Oil',
      slug: 'beard-oil',
      description: 'A lightweight grooming oil that softens beard hair, moisturizes the skin beneath, and promotes a healthier, well-maintained beard.',
      functionTag: 'Nourish',
      price: 5000,
      stockQuantity: 25,
      images: ['IMG_3525.PNG'],
      tags: ['oil', 'beard', 'grooming'],
    },
  ]

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    })
  }
  console.log('Seeded products.')

  // 2. Seed Admin User
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    console.warn('[Seed] Skipping admin user: SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD not set in .env')
  } else {
    const adminEmail = env.SEED_ADMIN_EMAIL
    const adminPassword = env.SEED_ADMIN_PASSWORD
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(adminPassword, salt)

    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {
        passwordHash: passwordHash,
      },
      create: {
        name: 'Hermione Admin',
        email: adminEmail.toLowerCase(),
        passwordHash: passwordHash,
        role: 'admin',
        isVerified: true,
        twoFactorEnabled: false,
      },
    })

    console.log('--------------------------------------------------')
    console.log('Seeded Admin account successfully!')
    console.log(`Email: ${adminEmail}`)
    console.log('Password: [set from .env variable SEED_ADMIN_PASSWORD]')
    console.log('Instructions: On first login, the admin dashboard portal')
    console.log('will present a 2FA Setup screen. Scan the generated QR code')
    console.log('with your Authenticator App (Google Authenticator, Duo, etc.)')
    console.log('and enter the verify code to activate 2FA for this account.')
    console.log('--------------------------------------------------')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
