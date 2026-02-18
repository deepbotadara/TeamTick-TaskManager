const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Set admin password to "admin123"
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { UserID: 1 },
    data: { PasswordHash: hash }
  });
  console.log('Admin password reset to: admin123');
  console.log('Admin email: admin@todolist.com');
  console.log('Admin username: admin');
}

main().then(() => prisma.$disconnect());
