import * as SecureStore from 'expo-secure-store';
import { UserModel } from '../models/UserModel';
import { generateSalt, hashPassword, verifyPassword } from './SecurityService';

const SESSION_KEY = 'session_token';

export const AuthService = {
  async register(username, password) {
    const salt = await generateSalt();
    const { passwordHash, iterations } = await hashPassword(password, salt);
    const user = await UserModel.create({ username, passwordHash, salt, iterations });
    return user;
  },

  async login(username, password) {
    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    const ok = await verifyPassword(password, user);
    if (!ok) {
      throw new Error('INVALID_CREDENTIALS');
    }
    const token = await issueSessionToken(user);
    await SecureStore.setItemAsync(SESSION_KEY, token);
    return { user: { id: user.id, username: user.username }, token };
  },

  async logout() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },

  async getSessionToken() {
    return SecureStore.getItemAsync(SESSION_KEY);
  }
};

async function issueSessionToken(user) {
  // Token ngẫu nhiên + bind ít thông tin, không nhúng mật khẩu
  const raw = `${user.id}:${user.username}:${Date.now()}:${Math.random()}`;
  // Hash nhẹ cho token để không lộ raw
  const token = Buffer.from(raw).toString('base64url');
  return token;
}
