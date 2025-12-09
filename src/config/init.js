// src/config/init.js
import { runMigrations, getDB } from './database';  // ✅ Cùng thư mục config
import { seedAdmin } from './seed';                 // ✅ Cùng thư mục config
import { seedMenuData } from './seedMenu';          // ✅ Cùng thư mục config
import { MenuModel } from '../models/MenuModel';    // ✅ Lên 1 cấp, vào models

export async function initDatabase() {
  try {
    console.log('🔧 Running migrations...');
    
    // Tạo bảng users
    runMigrations();
    
    // Tạo bảng menu
    MenuModel.createTable();
    MenuModel.createCategoriesTable();
    
    console.log('🌱 Running seeds...');
    
    // Seed data
    await seedAdmin();
    await seedMenuData();
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}