const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'quickpoll.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
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
`);

console.log('Database initialized successfully at:', dbPath);
db.close();