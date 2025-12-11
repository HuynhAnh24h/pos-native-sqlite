import { runMigrations } from './database';
import { seedAdmin } from './seed';
import { MenuModel } from '../models/MenuModel';
import { seedMenuData } from './seedMenu';
import { RoomModel } from '../models/RoomModel';  // ← Thêm import

export async function initDatabase() {
  try {
    console.log('🔧 Running migrations...');
    
    // Tạo bảng users
    runMigrations();
    
    // Tạo bảng menu
    MenuModel.createTable();
    MenuModel.createCategoriesTable();
    
    // Tạo bảng rooms  ← THÊM ĐOẠN NÀY
    RoomModel.createTable();
    RoomModel.createOrdersTable();
    RoomModel.createInvoicesTable();
    
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