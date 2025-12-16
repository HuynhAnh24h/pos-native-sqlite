// src/models/RoomModel.js
import { getDB } from '../config/database';

export const RoomModel = {
  // Tạo bảng rooms
  createTable: () => {
    const db = getDB();
    db.execSync(`
      CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price_per_hour REAL NOT NULL,
        status TEXT DEFAULT 'available',
        customer_name TEXT,
        customer_phone TEXT,
        start_time TEXT,
        session_id TEXT,
        created_at TEXT NOT NULL
      );
    `);
    console.log('✅ Rooms table created');
  },

  // Tạo bảng room_orders (đơn hàng của phòng)
  createOrdersTable: () => {
    const db = getDB();
    db.execSync(`
      CREATE TABLE IF NOT EXISTS room_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL,
        session_id TEXT NOT NULL,
        menu_item_id INTEGER NOT NULL,
        menu_item_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        total REAL NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id),
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      );
    `);
    console.log('✅ Room orders table created');
  },

  // Tạo bảng invoices (hóa đơn)
  createInvoicesTable: () => {
    const db = getDB();
    db.execSync(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        room_id INTEGER NOT NULL,
        room_name TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        duration_hours REAL NOT NULL,
        room_charge REAL NOT NULL,
        food_charge REAL NOT NULL,
        total_amount REAL NOT NULL,
        payment_method TEXT,
        paid_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id)
      );
    `);
    console.log('✅ Invoices table created');
  },

  // Lấy tất cả phòng
  findAll: () => {
    const db = getDB();
    try {
      return db.getAllSync('SELECT * FROM rooms ORDER BY name');
    } catch (error) {
      console.error('Error finding rooms:', error);
      return [];
    }
  },

  // Lấy phòng theo ID
  findById: (id) => {
    const db = getDB();
    try {
      const result = db.getAllSync('SELECT * FROM rooms WHERE id = ? LIMIT 1', [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error finding room:', error);
      return null;
    }
  },

  // Tạo phòng mới
  create: ({ name, pricePerHour }) => {
    const db = getDB();
    const now = new Date().toISOString();
    
    try {
      const result = db.runSync(
        `INSERT INTO rooms (name, price_per_hour, status, created_at)
         VALUES (?, ?, 'available', ?)`,
        [name, pricePerHour, now]
      );
      
      return {
        id: result.lastInsertRowId,
        name,
        pricePerHour,
        status: 'available',
        createdAt: now
      };
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  // Cập nhật phòng
  update: (id, { name, pricePerHour }) => {
    const db = getDB();
    
    try {
      db.runSync(
        'UPDATE rooms SET name = ?, price_per_hour = ? WHERE id = ?',
        [name, pricePerHour, id]
      );
      return true;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  // Xóa phòng
  delete: (id) => {
    const db = getDB();
    try {
      db.runSync('DELETE FROM rooms WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  // ============================================
  // SESSION MANAGEMENT - QUAN TRỌNG
  // ============================================

  /**
   * Check-in phòng (bắt đầu session mới)
   */
  checkIn: (id, { customerName, customerPhone }) => {
    const db = getDB();
    const now = new Date().toISOString();
    const sessionId = `SESSION_${Date.now()}_${id}`;
    
    try {
      db.runSync(
        `UPDATE rooms 
         SET status = 'occupied', 
             customer_name = ?, 
             customer_phone = ?, 
             start_time = ?,
             session_id = ?
         WHERE id = ?`,
        [customerName, customerPhone, now, sessionId, id]
      );
      
      return { sessionId, startTime: now };
    } catch (error) {
      console.error('Error checking in room:', error);
      throw error;
    }
  },

  /**
   * Lấy session hiện tại của phòng
   */
  getCurrentSession: (roomId) => {
    const db = getDB();
    try {
      const result = db.getAllSync(
        'SELECT session_id, start_time, customer_name, customer_phone FROM rooms WHERE id = ? LIMIT 1',
        [roomId]
      );
      
      if (result.length > 0 && result[0].session_id) {
        return {
          sessionId: result[0].session_id,
          startTime: result[0].start_time,
          customerName: result[0].customer_name,
          customerPhone: result[0].customer_phone
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  /**
   * Check-out phòng (kết thúc session)
   */
  checkOut: (id) => {
    const db = getDB();
    
    try {
      db.runSync(
        `UPDATE rooms 
         SET status = 'available',
             customer_name = NULL,
             customer_phone = NULL,
             start_time = NULL,
             session_id = NULL
         WHERE id = ?`,
        [id]
      );
      return true;
    } catch (error) {
      console.error('Error checking out room:', error);
      throw error;
    }
  },

  // ============================================
  // ORDERS MANAGEMENT
  // ============================================

  /**
   * Thêm order mới
   */
  addOrder: ({ roomId, sessionId, menuItemId, menuItemName, quantity, price }) => {
    const db = getDB();
    const now = new Date().toISOString();
    const total = quantity * price;
    
    try {
      const result = db.runSync(
        `INSERT INTO room_orders 
         (room_id, session_id, menu_item_id, menu_item_name, quantity, price, total, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [roomId, sessionId, menuItemId, menuItemName, quantity, price, total, now]
      );
      
      return {
        id: result.lastInsertRowId,
        roomId,
        sessionId,
        menuItemId,
        menuItemName,
        quantity,
        price,
        total,
        createdAt: now
      };
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả orders của một session
   */
  getOrdersBySession: (sessionId) => {
    const db = getDB();
    try {
      return db.getAllSync(
        'SELECT * FROM room_orders WHERE session_id = ? ORDER BY created_at',
        [sessionId]
      );
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  },

  /**
   * Xóa order
   */
  deleteOrder: (orderId) => {
    const db = getDB();
    try {
      db.runSync('DELETE FROM room_orders WHERE id = ?', [orderId]);
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  // ============================================
  // INVOICE MANAGEMENT
  // ============================================

  /**
   * Tạo hóa đơn và xóa orders của session
   */
  createInvoice: (invoiceData) => {
    const db = getDB();
    const now = new Date().toISOString();
    
    try {
      const result = db.runSync(
        `INSERT INTO invoices 
         (session_id, room_id, room_name, customer_name, customer_phone, 
          start_time, end_time, duration_hours, room_charge, food_charge, 
          total_amount, payment_method, paid_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoiceData.sessionId,
          invoiceData.roomId,
          invoiceData.roomName,
          invoiceData.customerName,
          invoiceData.customerPhone,
          invoiceData.startTime,
          invoiceData.endTime,
          invoiceData.durationHours,
          invoiceData.roomCharge,
          invoiceData.foodCharge,
          invoiceData.totalAmount,
          invoiceData.paymentMethod || 'cash',
          now,
          now
        ]
      );
      
      // Xóa orders của session này sau khi tạo invoice
      db.runSync('DELETE FROM room_orders WHERE session_id = ?', [invoiceData.sessionId]);
      
      return {
        id: result.lastInsertRowId,
        ...invoiceData,
        paidAt: now
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả hóa đơn
   */
  getAllInvoices: () => {
    const db = getDB();
    try {
      return db.getAllSync('SELECT * FROM invoices ORDER BY paid_at DESC');
    } catch (error) {
      console.error('Error getting invoices:', error);
      return [];
    }
  },

  /**
   * Lấy hóa đơn theo ID
   */
  getInvoiceById: (id) => {
    const db = getDB();
    try {
      const result = db.getAllSync('SELECT * FROM invoices WHERE id = ? LIMIT 1', [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting invoice:', error);
      return null;
    }
  }
};