// src/utils/DatabaseHelper.js
import { getDB } from '../config/database';
import { RoomModel } from '../models/RoomModel';
import { MenuModel } from '../models/MenuModel';

export const DatabaseHelper = {
  /**
   * RESET TOÀN BỘ DATABASE
   * Xóa tất cả bảng và tạo lại từ đầu
   */
  resetDatabase: () => {
    const db = getDB();
    
    try {
      console.log('🔥 RESETTING DATABASE...');
      
      // Bước 1: Xóa tất cả bảng
      db.execSync('DROP TABLE IF EXISTS invoices');
      console.log('✓ Dropped invoices table');
      
      db.execSync('DROP TABLE IF EXISTS room_orders');
      console.log('✓ Dropped room_orders table');
      
      db.execSync('DROP TABLE IF EXISTS menu_items');
      console.log('✓ Dropped menu_items table');
      
      db.execSync('DROP TABLE IF EXISTS rooms');
      console.log('✓ Dropped rooms table');
      
      // Bước 2: Tạo lại tất cả bảng
      RoomModel.createTable();
      RoomModel.createOrdersTable();
      RoomModel.createInvoicesTable();
      MenuModel.createTable();
      
      console.log('✅ DATABASE RESET COMPLETE!');
      return { success: true, message: 'Database reset successfully' };
    } catch (error) {
      console.error('❌ Error resetting database:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * XÓA DỮ LIỆU NHƯNG GIỮ LẠI BẢNG
   * Chỉ xóa data, không xóa structure
   */
  clearAllData: () => {
    const db = getDB();
    
    try {
      console.log('🧹 CLEARING ALL DATA...');
      
      db.execSync('DELETE FROM invoices');
      console.log('✓ Cleared invoices');
      
      db.execSync('DELETE FROM room_orders');
      console.log('✓ Cleared room_orders');
      
      db.execSync('DELETE FROM menu_items');
      console.log('✓ Cleared menu_items');
      
      db.execSync('DELETE FROM rooms');
      console.log('✓ Cleared rooms');
      
      console.log('✅ ALL DATA CLEARED!');
      return { success: true, message: 'All data cleared successfully' };
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * RESET CHỈ ORDERS VÀ INVOICES
   * Giữ lại rooms và menu
   */
  resetOrdersAndInvoices: () => {
    const db = getDB();
    
    try {
      console.log('🔄 Resetting orders and invoices...');
      
      db.execSync('DELETE FROM invoices');
      db.execSync('DELETE FROM room_orders');
      
      // Reset trạng thái các phòng về available
      db.execSync(`
        UPDATE rooms 
        SET status = 'available',
            customer_name = NULL,
            customer_phone = NULL,
            start_time = NULL,
            session_id = NULL
      `);
      
      console.log('✅ Orders and invoices reset!');
      return { success: true, message: 'Orders and invoices reset successfully' };
    } catch (error) {
      console.error('❌ Error resetting orders:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * THÊM CỘT SESSION_ID NẾU CHƯA CÓ
   * Dùng để fix lỗi "no such column: session_id"
   */
  addSessionIdColumn: () => {
    const db = getDB();
    
    try {
      console.log('🔧 Adding session_id column...');
      
      // Kiểm tra xem cột đã tồn tại chưa
      const tableInfo = db.getAllSync('PRAGMA table_info(rooms)');
      const hasSessionId = tableInfo.some(col => col.name === 'session_id');
      
      if (hasSessionId) {
        console.log('✓ session_id column already exists');
        return { success: true, message: 'Column already exists' };
      }
      
      // Thêm cột mới
      db.execSync('ALTER TABLE rooms ADD COLUMN session_id TEXT');
      console.log('✅ Added session_id column successfully!');
      
      return { success: true, message: 'Added session_id column' };
    } catch (error) {
      console.error('❌ Error adding column:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * XEM CẤU TRÚC BẢNG
   */
  showTableSchema: (tableName) => {
    const db = getDB();
    
    try {
      const schema = db.getAllSync(`PRAGMA table_info(${tableName})`);
      console.log(`\n📋 Schema of table "${tableName}":`);
      console.table(schema);
      return schema;
    } catch (error) {
      console.error(`❌ Error showing schema for ${tableName}:`, error);
      return null;
    }
  },

  /**
   * XEM TẤT CẢ CÁC BẢNG
   */
  showAllTables: () => {
    const db = getDB();
    
    try {
      const tables = db.getAllSync(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      );
      console.log('\n📚 All tables in database:');
      console.table(tables);
      return tables;
    } catch (error) {
      console.error('❌ Error showing tables:', error);
      return null;
    }
  },

  /**
   * ĐẾM SỐ LƯỢNG RECORDS
   */
  showRecordCounts: () => {
    const db = getDB();
    
    try {
      const counts = {
        rooms: db.getAllSync('SELECT COUNT(*) as count FROM rooms')[0]?.count || 0,
        menu_items: db.getAllSync('SELECT COUNT(*) as count FROM menu_items')[0]?.count || 0,
        room_orders: db.getAllSync('SELECT COUNT(*) as count FROM room_orders')[0]?.count || 0,
        invoices: db.getAllSync('SELECT COUNT(*) as count FROM invoices')[0]?.count || 0,
      };
      
      console.log('\n📊 Record counts:');
      console.table(counts);
      return counts;
    } catch (error) {
      console.error('❌ Error counting records:', error);
      return null;
    }
  },

  /**
   * SEED DỮ LIỆU MẪU
   */
  seedSampleData: () => {
    const db = getDB();
    const now = new Date().toISOString();
    
    try {
      console.log('🌱 Seeding sample data...');
      
      // Thêm phòng mẫu
      db.runSync(
        `INSERT INTO rooms (name, price_per_hour, status, created_at) 
         VALUES (?, ?, 'available', ?)`,
        ['Phòng VIP 01', 150000, now]
      );
      
      db.runSync(
        `INSERT INTO rooms (name, price_per_hour, status, created_at) 
         VALUES (?, ?, 'available', ?)`,
        ['Phòng VIP 02', 150000, now]
      );
      
      db.runSync(
        `INSERT INTO rooms (name, price_per_hour, status, created_at) 
         VALUES (?, ?, 'available', ?)`,
        ['Phòng Standard 01', 100000, now]
      );
      
      // Thêm menu mẫu
      db.runSync(
        `INSERT INTO menu_items (name, description, price, category, is_available, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)`,
        ['Coca Cola', 'Lon 330ml', 15000, 'do-uong', now, now]
      );
      
      db.runSync(
        `INSERT INTO menu_items (name, description, price, category, is_available, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)`,
        ['Snack khoai tây', 'Túi 50g', 20000, 'snack', now, now]
      );
      
      db.runSync(
        `INSERT INTO menu_items (name, description, price, category, is_available, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)`,
        ['Đĩa trái cây', 'Dưa hấu, dứa, xoài', 50000, 'trai-cay', now, now]
      );
      
      console.log('✅ Sample data seeded successfully!');
      return { success: true, message: 'Sample data added' };
    } catch (error) {
      console.error('❌ Error seeding data:', error);
      return { success: false, message: error.message };
    }
  }
};