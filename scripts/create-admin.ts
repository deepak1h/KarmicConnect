// create-admin.ts

// Make sure you have your admin client configured to use the SERVICE_ROLE_KEY
import { supabaseAdmin } from '../server/supabaseAdminClient'; // Adjust path as needed
import 'dotenv/config'; // Ensure .env variables are loaded

async function createAdmin() {
  const adminEmail = 'admin@karmic.com';
  const adminPassword = 'admin123'; // Change this to a stronger password!

  try {
    // Check if the user already exists
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;
    
    const existingUser = users.find(user => user.email === adminEmail);
    
    if (existingUser) {
      console.log('Admin user already exists:', existingUser.email);
      console.log('Login credentials:', adminEmail, '/', adminPassword);
      process.exit(0);
    }

    // If not, create the user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Auto-confirm email since we are creating it on the server
      user_metadata: {
        // This is how we assign a role!
        role: 'admin',
        // You can add other info here if you like
        username: 'admin' 
      }
    });

    if (error) {
      throw error;
    }

    console.log('Admin user created successfully in Supabase Auth:', data.user.email);
    console.log('Login credentials:', adminEmail, '/', adminPassword);
    process.exit(0);

  } catch (error: any) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();