import { generateSalt, hashPassword } from '../services/SecurityService';
import { UserModel } from '../models/UserModel';

export async function seedAdmin() {
  try {
    console.log('🔍 Checking for existing admin...');
    
    const existing = UserModel.findByUsername('admin');
    
    if (existing) {
      console.log('ℹ️  Admin account already exists');
      return;
    }

    console.log('🔐 Generating password hash...');
    const salt = await generateSalt();
    const { passwordHash, iterations } = await hashPassword('Admin@123', salt);
    
    console.log('💾 Creating admin user...');
    UserModel.create({
      username: 'admin',
      passwordHash,
      salt,
      iterations,
      role: 'admin'
    });
    
    console.log('✅ Admin account created:');
    console.log('   Username: admin');
    console.log('   Password: Admin@123');
  } catch (error) {
    console.error('❌ Failed to seed admin:', error);
    throw error;
  }
}