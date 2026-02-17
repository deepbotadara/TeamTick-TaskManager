// Test database connection with Prisma
import { prisma } from './lib/prisma';

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test connection by querying users
    const userCount = await prisma.user.count();
    console.log('✅ Database connected successfully!');
    console.log(`📊 Found ${userCount} users in the database`);
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        UserID: true,
        UserName: true,
        Email: true,
        CreatedAt: true,
      }
    });
    
    console.log('\n👥 Users:');
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
      }
    });
    
    console.log('\n✅ Tasks:');
    tasks.forEach(task => {
      console.log(`  - ${task.Title} [${task.Status}] - Priority: ${task.Priority}`);
    });
    
    console.log('\n✨ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
