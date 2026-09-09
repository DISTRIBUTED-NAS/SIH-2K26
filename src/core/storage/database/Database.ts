import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export const openDatabase = (): SQLite.SQLiteDatabase => {
  if (!_db) {
    _db = SQLite.openDatabaseSync('scaleguard.db');
  }
  return _db;
};

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = openDatabase();
  
  try {
    // We use WAL mode for better concurrency and performance
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS inspections (
        id TEXT PRIMARY KEY NOT NULL,
        applicationId TEXT NOT NULL,
        businessName TEXT,
        instrumentName TEXT NOT NULL,
        instrumentModel TEXT,
        location TEXT,
        scheduledDate TEXT,
        scheduledTime TEXT,
        assignedOfficerId TEXT,
        status TEXT NOT NULL,
        notes TEXT,
        observations TEXT,
        remarks TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        syncStatus TEXT DEFAULT 'PENDING'
      );

      CREATE TABLE IF NOT EXISTS inspection_checklist (
        id TEXT PRIMARY KEY NOT NULL,
        inspectionId TEXT NOT NULL,
        checklistItemId TEXT NOT NULL,
        label TEXT NOT NULL,
        status TEXT NOT NULL,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inspectionId) REFERENCES inspections (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS inspection_measurements (
        id TEXT PRIMARY KEY NOT NULL,
        inspectionId TEXT NOT NULL,
        measurementId TEXT NOT NULL,
        label TEXT NOT NULL,
        value TEXT NOT NULL,
        unit TEXT NOT NULL,
        note TEXT,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inspectionId) REFERENCES inspections (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS inspection_photos (
        id TEXT PRIMARY KEY NOT NULL,
        inspectionId TEXT NOT NULL,
        photoType TEXT DEFAULT 'OFFICER_EVIDENCE',
        localUri TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inspectionId) REFERENCES inspections (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ai_verification_results (
        id TEXT PRIMARY KEY NOT NULL,
        inspectionId TEXT NOT NULL,
        referencePhotoId TEXT,
        officerPhotoId TEXT,
        status TEXT NOT NULL,
        confidence REAL,
        findings TEXT,
        processingStatus TEXT,
        errorMessage TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        syncStatus TEXT DEFAULT 'PENDING',
        FOREIGN KEY (inspectionId) REFERENCES inspections (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT,
        status TEXT DEFAULT 'PENDING',
        retryCount INTEGER DEFAULT 0,
        errorMessage TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Run migrations for columns on existing tables
    const columnMigrations = [
      `ALTER TABLE inspection_photos ADD COLUMN photoType TEXT DEFAULT 'OFFICER_EVIDENCE';`,
      `ALTER TABLE inspections ADD COLUMN decision TEXT;`,
      `ALTER TABLE inspections ADD COLUMN decisionRemarks TEXT;`,
      `ALTER TABLE inspections ADD COLUMN completedAt TEXT;`,
      `ALTER TABLE inspections ADD COLUMN syncStatus TEXT DEFAULT 'PENDING';`,
      `ALTER TABLE inspections ADD COLUMN updatedAt TEXT;`,
      `ALTER TABLE inspections ADD COLUMN createdAt TEXT;`,
      `ALTER TABLE ai_verification_results ADD COLUMN syncStatus TEXT DEFAULT 'PENDING';`,
      `ALTER TABLE ai_verification_results ADD COLUMN updatedAt TEXT;`,
    ];
    for (const sql of columnMigrations) {
      try {
        await db.execAsync(sql);
      } catch (e) {
        // Ignore if column already exists
      }
    }

    // Phase 12 — notification records table
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS notification_records (
          id TEXT PRIMARY KEY NOT NULL,
          inspectionId TEXT NOT NULL,
          notificationType TEXT NOT NULL,
          scheduledNotificationId TEXT NOT NULL,
          scheduledFor TEXT NOT NULL,
          status TEXT DEFAULT 'SCHEDULED',
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (e) {
      // Ignore if already exists
    }

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};
