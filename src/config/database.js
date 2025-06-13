import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let db = null;

export async function getDatabase() {
  if (db) {
    return db;
  }

  db = await open({
    filename: path.join(process.cwd(), 'database', 'simulations.db'),
    driver: sqlite3.Database
  });

  return db;
}

export async function initDatabase() {
  const db = await getDatabase();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      state TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS simulations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      capacity REAL,
      location TEXT,
      delta_t REAL,
      water_flow REAL,
      drycooler_data TEXT,
      tower_data TEXT,
      comparison_data TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    );
  `);

  return db;
}
