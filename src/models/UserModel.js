import { getDB } from "../config/database"

export const UserModel = {
  // Tìm user theo username
  findByUsername: (username) => {
    const db = getDB();
    try {
      const result = db.getAllSync(
        'SELECT * FROM users WHERE username = ? LIMIT 1',
        [username]
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  },

  // Tạo user mới
  create: ({ username, passwordHash, salt, iterations, role = 'user' }) => {
    const db = getDB();
    const createdAt = new Date().toISOString();
    
    try {
      const result = db.runSync(
        `INSERT INTO users (username, password_hash, salt, iterations, role, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, passwordHash, salt, iterations, role, createdAt]
      );
      
      return {
        id: result.lastInsertRowId,
        username,
        role,
        createdAt
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Lấy tất cả users (để debug)
  findAll: () => {
    const db = getDB();
    try {
      return db.getAllSync('SELECT id, username, role, created_at FROM users');
    } catch (error) {
      console.error('Error finding all users:', error);
      return [];
    }
  },

  // Xóa user (optional)
  deleteByUsername: (username) => {
    const db = getDB();
    try {
      db.runSync('DELETE FROM users WHERE username = ?', [username]);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
};