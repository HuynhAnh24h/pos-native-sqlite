import * as SQLite from 'expo-sqlite';

let db;

export const getDB = () => {
  if (!db) {
    db = SQLite.openDatabaseSync('app.db');
  }
  return db;
};

export const runMigrations = () => {  // ← Không có "default"
  const database = getDB();
  
  try {
    database.execSync(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        iterations INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL
      );`
    );
    console.log('✅ Users table created');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};