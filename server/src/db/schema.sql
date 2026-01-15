-- PillTime Database Schema
-- SQLite Database for Medication Tracking

-- Medications table: stores medication information and schedules
CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    dosage TEXT,                         -- e.g., "500mg", "2 pills"
    frequency TEXT NOT NULL,              -- 'daily', 'twice-daily', 'custom'
    times TEXT NOT NULL,                  -- JSON array: ["09:00", "21:00"]
    start_date DATE NOT NULL,
    end_date DATE,                        -- NULL for ongoing medications
    active BOOLEAN DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication logs: track when medications were taken
CREATE TABLE IF NOT EXISTS medication_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medication_id INTEGER NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,    -- When it should be taken
    taken_time TIMESTAMP,                 -- When it was actually taken
    status TEXT NOT NULL,                 -- 'taken', 'missed', 'pending', 'skipped'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
);

-- Indexes for faster queries on medication_logs
CREATE INDEX IF NOT EXISTS idx_logs_medication_id ON medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_logs_scheduled_time ON medication_logs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_logs_status ON medication_logs(status);

-- Push subscriptions: store browser push notification endpoints
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT UNIQUE NOT NULL,
    keys TEXT NOT NULL,                   -- JSON: {p256dh, auth}
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings: application configuration
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES
    ('notifications_enabled', 'true'),
    ('reminder_advance_minutes', '0'),
    ('theme', 'light'),
    ('timezone', 'UTC');
