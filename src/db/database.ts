/**
 * SQLite handle + schema migration. One lazily-opened connection per app run.
 */
import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("reia.db").then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS deals (
          id TEXT PRIMARY KEY NOT NULL,
          address TEXT NOT NULL,
          leadId TEXT,
          inputs TEXT NOT NULL,
          snapshot TEXT NOT NULL,
          verdict TEXT NOT NULL,
          status TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS leads (
          id TEXT PRIMARY KEY NOT NULL,
          address TEXT NOT NULL,
          city TEXT NOT NULL,
          lat REAL NOT NULL,
          lng REAL NOT NULL,
          distanceMi REAL NOT NULL,
          heat TEXT NOT NULL,
          motivationScore INTEGER NOT NULL,
          status TEXT NOT NULL,
          distressTags TEXT NOT NULL,
          flags TEXT NOT NULL,
          photos INTEGER NOT NULL,
          owner TEXT,
          note TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );
      `);
      return db;
    });
  }
  return dbPromise;
}
