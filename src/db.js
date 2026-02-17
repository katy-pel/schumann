const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'schumann.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    init();
  }
  return db;
}

function init() {
  const d = getDb();

  d.exec(`
    CREATE TABLE IF NOT EXISTS measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      main_frequency REAL NOT NULL,
      amplitude REAL,
      power REAL,
      trend TEXT,
      type TEXT NOT NULL DEFAULT 'scheduled',
      raw_json TEXT
    )
  `);

  d.exec(`
    CREATE TABLE IF NOT EXISTS scrape_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'scheduled',
      status TEXT NOT NULL,
      error_message TEXT
    )
  `);
}

function insertMeasurement(data, type = 'scheduled') {
  const d = getDb();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 5);

  const stmt = d.prepare(`
    INSERT INTO measurements (timestamp, date, time, main_frequency, amplitude, power, trend, type, raw_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Normalize: fetchLatest has main_frequency/amplitude at top level,
  // fetchData has them in frequencies[0]
  const sr1 = data.frequencies?.[0];
  const mainFreq = data.main_frequency ?? sr1?.frequency ?? null;
  const amplitude = data.amplitude ?? sr1?.amplitude ?? null;
  const power = sr1?.power ?? null;
  const trend = sr1?.trend ?? null;

  return stmt.run(
    Math.floor(now.getTime() / 1000),
    dateStr,
    timeStr,
    mainFreq,
    amplitude,
    power,
    trend,
    type,
    JSON.stringify(data)
  );
}

function getLast30Days() {
  const d = getDb();
  return d.prepare(`
    SELECT id, timestamp, date, time, main_frequency, amplitude, power, trend, type
    FROM measurements
    WHERE date >= date('now', '-30 days')
    ORDER BY timestamp ASC
  `).all();
}

function getLatest() {
  const d = getDb();
  return d.prepare(`
    SELECT id, timestamp, date, time, main_frequency, amplitude, power, trend, type, raw_json
    FROM measurements
    ORDER BY timestamp DESC
    LIMIT 1
  `).get();
}

function getYesterdayMax() {
  const d = getDb();
  return d.prepare(`
    SELECT MAX(main_frequency) as max_frequency, MAX(amplitude) as max_amplitude
    FROM measurements
    WHERE date = date('now', '-1 day')
  `).get();
}

function getTodayMax() {
  const d = getDb();
  return d.prepare(`
    SELECT MAX(main_frequency) as max_frequency, MAX(amplitude) as max_amplitude
    FROM measurements
    WHERE date = date('now')
  `).get();
}

function cleanOldData() {
  const d = getDb();
  const info = d.prepare(`DELETE FROM measurements WHERE date < date('now', '-30 days')`).run();
  d.prepare(`DELETE FROM scrape_logs WHERE timestamp < unixepoch('now', '-30 days')`).run();
  return info.changes;
}

function logScrape(type, status, errorMessage = null) {
  const d = getDb();
  d.prepare(`
    INSERT INTO scrape_logs (timestamp, type, status, error_message)
    VALUES (?, ?, ?, ?)
  `).run(Math.floor(Date.now() / 1000), type, status, errorMessage);
}

function getLastScrapeLog() {
  const d = getDb();
  return d.prepare(`
    SELECT * FROM scrape_logs ORDER BY timestamp DESC LIMIT 1
  `).get();
}

function getRecentFailCount() {
  const d = getDb();
  const rows = d.prepare(`
    SELECT status FROM scrape_logs ORDER BY timestamp DESC LIMIT 3
  `).all();
  return rows.filter(r => r.status === 'fail').length;
}

module.exports = {
  getDb,
  insertMeasurement,
  getLast30Days,
  getLatest,
  getYesterdayMax,
  getTodayMax,
  cleanOldData,
  logScrape,
  getLastScrapeLog,
  getRecentFailCount,
};
