import { supabase } from "../server/db";
import bcrypt from "bcrypt";

async function createAdmin(email: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: admin, error } = await supabase
      .from('admins')
      .insert({
        email,
        password: hashedPassword,
      })
      .select()
      .single();

    if (error) throw error;

    console.log("Admin created successfully:", admin.email);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    process.exit();
  }
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Please provide email and password");
  console.log("Usage: npm run create-admin <email> <password>");
  process.exit(1);
}

createAdmin(email, password); 