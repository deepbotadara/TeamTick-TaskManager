// Test database connection with Prisma
const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Debug: Print environment variable
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded ✓' : 'Not found ✗');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    console.log(`📍 Connecting to: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')}`);
    
    // Test connection by querying users
    const userCount = await prisma.user.count();
    console.log('✅ Database connected successfully!');
    console.log(`📊 Found ${userCount} users in the database\n`);
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        UserID: true,
        UserName: true,
        Email: true,
        CreatedAt: true,
      }
    });
    
    console.log('👥 Users:');
    users.forEach(user => {
      console.log(`  - ${user.UserName} (${user.Email})`);
    });
    
    // Get all projects
    const projects = await prisma.project.findMany({
      select: {
        ProjectID: true,
        ProjectName: true,
        Description: true,
      }
    });
    
    console.log('\n📁 Projects:');
    projects.forEach(project => {
      console.log(`  - ${project.ProjectName}: ${project.Description}`);
    });
    
    // Get all tasks
    const tasks = await prisma.task.findMany({
      select: {
        TaskID: true,
        Title: true,
        Status: true,
        Priority: true,
      },
      take: 10
    });
    
    console.log('\n✅ Tasks:');
    tasks.forEach(task => {
      console.log(`  - ${task.Title} [${task.Status}] - Priority: ${task.Priority}`);
    });
    
    console.log('\n✨ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
