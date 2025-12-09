import { UserModel } from '../models/UserModel';
import { generateSalt, hashPassword, verifyPassword } from '../services/SecurityService';

export const AuthController = {
  async handleRegister({ username, password }) {
    // Validation
    if (!username || !password || username.length < 3 || password.length < 6) {
      throw new Error('INVALID_INPUT');
    }

    // Check existing user
    const existing = UserModel.findByUsername(username);
    if (existing) {
      throw new Error('USER_EXISTS');
    }

    // Create user
    const salt = await generateSalt();
    const { passwordHash, iterations } = await hashPassword(password, salt);
    
    const user = UserModel.create({
      username,
      passwordHash,
      salt,
      iterations,
      role: 'user'
    });

    return { userId: user.id, username: user.username, role: user.role };
  },

  async handleLogin({ username, password }) {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Username:', username);
    
    // Validation
    if (!username || !password) {
      throw new Error('INVALID_INPUT');
    }

    // Find user
    const user = UserModel.findByUsername(username);
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    console.log('User data:', {
      id: user.id,
      username: user.username,
      role: user.role,
      hasHash: !!user.password_hash,
      hasSalt: !!user.salt,
      iterations: user.iterations
    });

    // Verify password
    console.log('Verifying password...');
    const isValid = await verifyPassword(
      password,
      user.salt,
      user.password_hash,
      user.iterations
    );

    console.log('Password valid:', isValid);

    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    console.log('✅ Login successful');
    return {
      userId: user.id,
      username: user.username,
      role: user.role
    };
  }
};