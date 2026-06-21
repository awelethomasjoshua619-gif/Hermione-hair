// Query DB and save to a file
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function dumpUsers() {
  try {
    const users = await prisma.user.findMany()
    fs.writeFileSync('C:\\Users\\tjayt\\.gemini\\antigravity\\brain\\c4390ae7-d04e-4f5f-8f0f-13bcf3d3af09\\scratch\\db_users.json', JSON.stringify(users, null, 2))
    console.log('Saved to db_users.json')
  } catch(e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}
dumpUsers()
