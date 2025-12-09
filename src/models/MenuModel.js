// src/models/MenuModel.js
import { getDB } from '../config/database';

export const MenuModel = {
  // Tạo bảng menu
  createTable: () => {
    const db = getDB();
    db.execSync(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        is_available INTEGER DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  },

  // Tạo bảng categories
  createCategoriesTable: () => {
    const db = getDB();
    db.execSync(`
      CREATE TABLE IF NOT EXISTS menu_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);
  },

  // Lấy tất cả items
  findAll: () => {
    const db = getDB();
    try {
      return db.getAllSync('SELECT * FROM menu_items ORDER BY category, name');
    } catch (error) {
      console.error('Error finding all menu items:', error);
      return [];
    }
  },

  // Lấy items theo category
  findByCategory: (category) => {
    const db = getDB();
    try {
      return db.getAllSync(
        'SELECT * FROM menu_items WHERE category = ? ORDER BY name',
        [category]
      );
    } catch (error) {
      console.error('Error finding menu items by category:', error);
      return [];
    }
  },

  // Lấy item theo ID
  findById: (id) => {
    const db = getDB();
    try {
      const result = db.getAllSync(
        'SELECT * FROM menu_items WHERE id = ? LIMIT 1',
        [id]
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error finding menu item:', error);
      return null;
    }
  },

  // Tạo item mới
  create: ({ name, description, price, category, imageUrl, isAvailable = 1 }) => {
    const db = getDB();
    const now = new Date().toISOString();
    
    try {
      const result = db.runSync(
        `INSERT INTO menu_items (name, description, price, category, image_url, is_available, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, description, price, category, imageUrl, isAvailable, now, now]
      );
      
      return {
        id: result.lastInsertRowId,
        name,
        description,
        price,
        category,
        imageUrl,
        isAvailable,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw error;
    }
  },

  // Cập nhật item
  update: (id, { name, description, price, category, imageUrl, isAvailable }) => {
    const db = getDB();
    const now = new Date().toISOString();
    
    try {
      db.runSync(
        `UPDATE menu_items 
         SET name = ?, description = ?, price = ?, category = ?, image_url = ?, is_available = ?, updated_at = ?
         WHERE id = ?`,
        [name, description, price, category, imageUrl, isAvailable, now, id]
      );
      return true;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  },

  // Xóa item
  delete: (id) => {
    const db = getDB();
    try {
      db.runSync('DELETE FROM menu_items WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  },

  // Lấy tất cả categories
  getAllCategories: () => {
    const db = getDB();
    try {
      return db.getAllSync('SELECT * FROM menu_categories ORDER BY order_index');
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  },

  // Thêm category
  addCategory: (name, icon) => {
    const db = getDB();
    const now = new Date().toISOString();
    
    try {
      const result = db.runSync(
        'INSERT INTO menu_categories (name, icon, created_at) VALUES (?, ?, ?)',
        [name, icon, now]
      );
      return { id: result.lastInsertRowId, name, icon };
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }
};