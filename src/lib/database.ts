import { Pool } from 'pg'
import Database from 'better-sqlite3'
import path from 'path'

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL
const isPostgreSQL = DATABASE_URL?.startsWith('postgresql://')
const isProduction = process.env.NODE_ENV === 'production'

// Database instances
let pgPool: Pool | null = null
let sqliteDb: Database.Database | null = null

// Initialize database connection
if (isPostgreSQL) {
  pgPool = new Pool({
    connectionString: DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  })
} else {
  const dbPath = isProduction 
    ? '/tmp/quickpoll.db' 
    : path.join(process.cwd(), 'quickpoll.db')
  
  sqliteDb = new Database(dbPath)
  sqliteDb.pragma('journal_mode = WAL')
}

// Database query interface
export interface DatabaseInterface {
  query(sql: string, params?: any[]): Promise<any[]>
  get(sql: string, params?: any[]): Promise<any>
  run(sql: string, params?: any[]): Promise<{ lastInsertRowid?: number; changes?: number }>
  transaction<T>(fn: () => Promise<T>): Promise<T>
}

// Helper function to convert SQLite-style (?) to PostgreSQL-style ($1, $2) parameters
function convertSqliteToPostgres(sql: string): string {
  let paramIndex = 1
  return sql.replace(/\?/g, () => `$${paramIndex++}`)
}

// PostgreSQL implementation
class PostgreSQLDatabase implements DatabaseInterface {
  private pool: Pool

  constructor(pool: Pool) {
    this.pool = pool
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    const convertedSql = convertSqliteToPostgres(sql)
    const result = await this.pool.query(convertedSql, params)
    return result.rows
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const convertedSql = convertSqliteToPostgres(sql)
    const result = await this.pool.query(convertedSql, params)
    return result.rows[0] || null
  }

  async run(sql: string, params: any[] = []): Promise<{ lastInsertRowid?: number; changes?: number }> {
    const convertedSql = convertSqliteToPostgres(sql)
    const result = await this.pool.query(convertedSql, params)
    return { changes: result.rowCount || 0 }
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const result = await fn()
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

// SQLite implementation
class SQLiteDatabase implements DatabaseInterface {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    const stmt = this.db.prepare(sql)
    return stmt.all(...params)
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const stmt = this.db.prepare(sql)
    return stmt.get(...params) || null
  }

  async run(sql: string, params: any[] = []): Promise<{ lastInsertRowid?: number; changes?: number }> {
    const stmt = this.db.prepare(sql)
    const result = stmt.run(...params)
    return { 
      lastInsertRowid: Number(result.lastInsertRowid),
      changes: result.changes 
    }
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.db.transaction(() => fn())()
  }
}

// Export database instance
export const db: DatabaseInterface = isPostgreSQL && pgPool
  ? new PostgreSQLDatabase(pgPool)
  : new SQLiteDatabase(sqliteDb!)

// Database initialization
export async function initializeDatabase() {
  const createTablesSQL = isPostgreSQL ? `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      subscription_tier VARCHAR(50) DEFAULT 'free',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS surveys (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      type VARCHAR(50) NOT NULL,
      settings TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS survey_options (
      id UUID PRIMARY KEY,
      survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
      label VARCHAR(255) NOT NULL,
      value VARCHAR(255) NOT NULL,
      emoji VARCHAR(10),
      color VARCHAR(20),
      position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS responses (
      id UUID PRIMARY KEY,
      survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
      recipient_id VARCHAR(255) NOT NULL,
      option_id UUID NOT NULL REFERENCES survey_options(id) ON DELETE CASCADE,
      metadata TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS response_events (
      id UUID PRIMARY KEY,
      response_id UUID REFERENCES responses(id) ON DELETE SET NULL,
      event_type VARCHAR(100) NOT NULL,
      ip_address INET,
      user_agent TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bot_scores (
      response_id UUID PRIMARY KEY REFERENCES responses(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      factors TEXT NOT NULL,
      is_confirmed BOOLEAN DEFAULT FALSE
    );

    CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);
    CREATE INDEX IF NOT EXISTS idx_survey_options_survey_id ON survey_options(survey_id);
    CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON responses(survey_id);
    CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);
    CREATE INDEX IF NOT EXISTS idx_response_events_timestamp ON response_events(timestamp);
  ` : `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      subscription_tier TEXT DEFAULT 'free',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS surveys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      settings TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS survey_options (
      id TEXT PRIMARY KEY,
      survey_id TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      emoji TEXT,
      color TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      survey_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      option_id TEXT NOT NULL,
      metadata TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
      FOREIGN KEY (option_id) REFERENCES survey_options(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS response_events (
      id TEXT PRIMARY KEY,
      response_id TEXT,
      event_type TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS bot_scores (
      response_id TEXT PRIMARY KEY,
      score INTEGER NOT NULL,
      factors TEXT NOT NULL,
      is_confirmed BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);
    CREATE INDEX IF NOT EXISTS idx_survey_options_survey_id ON survey_options(survey_id);
    CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON responses(survey_id);
    CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);
    CREATE INDEX IF NOT EXISTS idx_response_events_timestamp ON response_events(timestamp);
  `

  // Execute each statement separately for both databases
  const statements = createTablesSQL.split(';').filter(stmt => stmt.trim())
  for (const statement of statements) {
    if (statement.trim()) {
      await db.run(statement.trim())
    }
  }

  console.log(`Database initialized successfully (${isPostgreSQL ? 'PostgreSQL' : 'SQLite'})`)
}