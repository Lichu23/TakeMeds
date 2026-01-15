import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path from environment or default
const DB_PATH = process.env.DATABASE_PATH || join(__dirname, '..', '..', 'database.sqlite');

// Initialize database connection
const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Execute schema SQL
  db.exec(schema);

  console.log('Database initialized successfully at:', DB_PATH);
}

// Helper function to run migrations in the future
export function runMigrations() {
  // Placeholder for future migrations
  // We can add migration logic here as the app evolves
}

// Export database instance
export default db;
