const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { userRoles: { include: { role: true } } } });
  console.log('Existing users:');
  users.forEach(u => {
    const roles = u.userRoles.map(ur => ur.role.RoleName).join(', ');
    console.log('  ID:', u.UserID, '| Username:', u.UserName, '| Email:', u.Email, '| Roles:', roles || 'None');
  });
  const adminRole = await prisma.role.findFirst({ where: { RoleName: 'Admin' } });
  console.log('\nAdmin role:', adminRole);
}

main().then(() => prisma.$disconnect());
