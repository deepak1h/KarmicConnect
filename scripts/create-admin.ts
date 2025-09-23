import bcrypt from "bcrypt";
import { db } from "../server/db";
import { adminUsers } from "../shared/schema";

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [admin] = await db.insert(adminUsers).values({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@karmicinternational.com'
    }).returning();
    
    console.log('Admin user created:', admin.username);
    console.log('Login credentials: admin / admin123');
    process.exit(0);
  } catch (error: any) {
    if (error.message.includes('duplicate key')) {
      console.log('Admin user already exists');
      console.log('Login credentials: admin / admin123');
    } else {
      console.error('Error creating admin:', error.message);
    }
    process.exit(0);
  }
}

createAdmin();