const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const emails = ['drdracula6699@gmail.com', 'dragon66199@gmail.com']
  const password = 'password123'
  
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(password, salt)
  
  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      await prisma.user.update({
        where: { email },
        data: { passwordHash, isVerified: true } // Auto-verify too to make shopping easier
      })
      console.log(`Password reset for ${email} successfully to '${password}' and marked as verified!`)
    } else {
      console.log(`User ${email} not found.`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
