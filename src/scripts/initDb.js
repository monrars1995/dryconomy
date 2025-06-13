import { getDatabase } from '../config/database.js';

async function initDatabase() {
  try {
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
        capacity REAL NOT NULL,
        location TEXT NOT NULL,
        delta_t REAL NOT NULL,
        water_flow REAL NOT NULL,
        drycooler_data TEXT,
        tower_data TEXT,
        comparison_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id)
      );
    `);

    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

initDatabase();
