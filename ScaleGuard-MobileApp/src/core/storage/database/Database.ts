import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export const resetDatabaseConnection = () => {
  _db = null;
};

export const openDatabase = (): SQLite.SQLiteDatabase => {
  if (!_db) {
    _db = SQLite.openDatabaseSync('scaleguard.db');
  }
  return _db;
};

const runInitMigrations = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  // We use WAL mode for better concurrency and performance
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS registered_instruments (
        id TEXT PRIMARY KEY NOT NULL,
        registrationId TEXT UNIQUE NOT NULL,
        userId TEXT,
        businessName TEXT,
        instrumentName TEXT NOT NULL,
        instrumentModel TEXT,
        capacity TEXT,
        registeredImageUri TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inspections (
        id TEXT PRIMARY KEY NOT NULL,
        applicationId TEXT NOT NULL,
        registrationId TEXT,
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
        decision TEXT,
        decisionRemarks TEXT,
        completedAt TEXT,
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
        recognizedRegistrationId TEXT,
        referencePhotoId TEXT,
        officerPhotoId TEXT,
        status TEXT NOT NULL,
        confidence REAL,
        ocrConfidence REAL,
        visualScore REAL,
        featureScore REAL,
        labelScore REAL,
        finalScore REAL,
        decision TEXT,
        ransacInliers INTEGER,
        keypointMatches INTEGER,
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
      `ALTER TABLE inspections ADD COLUMN registrationId TEXT;`,
      `ALTER TABLE inspections ADD COLUMN decision TEXT;`,
      `ALTER TABLE inspections ADD COLUMN decisionRemarks TEXT;`,
      `ALTER TABLE inspections ADD COLUMN completedAt TEXT;`,
      `ALTER TABLE inspections ADD COLUMN syncStatus TEXT DEFAULT 'PENDING';`,
      `ALTER TABLE inspections ADD COLUMN updatedAt TEXT;`,
      `ALTER TABLE inspections ADD COLUMN createdAt TEXT;`,
      `ALTER TABLE ai_verification_results ADD COLUMN recognizedRegistrationId TEXT;`,
      `ALTER TABLE ai_verification_results ADD COLUMN ocrConfidence REAL;`,
      `ALTER TABLE ai_verification_results ADD COLUMN visualScore REAL;`,
      `ALTER TABLE ai_verification_results ADD COLUMN featureScore REAL;`,
      `ALTER TABLE ai_verification_results ADD COLUMN labelScore REAL;`,
      `ALTER TABLE ai_verification_results ADD COLUMN finalScore REAL;`,
      `ALTER TABLE ai_verification_results ADD COLUMN decision TEXT;`,
      `ALTER TABLE ai_verification_results ADD COLUMN ransacInliers INTEGER;`,
      `ALTER TABLE ai_verification_results ADD COLUMN keypointMatches INTEGER;`,
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
};

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    const db = openDatabase();
    await runInitMigrations(db);
    console.log('Database initialized successfully');
    return db;
  } catch (error: any) {
    const errStr = String(error?.message || error);
    if (errStr.includes('NullPointerException') || errStr.includes('prepareAsync') || errStr.includes('rejected')) {
      console.warn('Recovering database connection after native reload error...');
      resetDatabaseConnection();
      const freshDb = openDatabase();
      await runInitMigrations(freshDb);
      console.log('Database initialized successfully after recovery');
      return freshDb;
    }
    console.error('Error initializing database:', error);
    throw error;
  }
};
