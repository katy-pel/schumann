const express = require('express');
const path = require('path');
const db = require('./src/db');
const scraper = require('./src/scraper');
const scheduler = require('./src/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API: latest measurement from DB
app.get('/api/latest', (req, res) => {
  const row = db.getLatest();
  if (!row) return res.json({ error: 'Žádná data' });
  res.json(row);
});

// API: 30-day history
app.get('/api/history', (req, res) => {
  const rows = db.getLast30Days();
  res.json(rows);
});

// API: ad-hoc scrape
app.post('/api/scrape', async (req, res) => {
  try {
    const data = await scraper.fetchData();
    db.insertMeasurement(data, 'adhoc');
    db.logScrape('adhoc', 'success');
    const latest = db.getLatest();
    res.json(latest);
  } catch (err) {
    db.logScrape('adhoc', 'fail', err.message);
    res.status(502).json({ error: 'Scrape selhal', message: err.message });
  }
});

// API: status of last scrape
app.get('/api/status', (req, res) => {
  const log = db.getLastScrapeLog();
  const todayMax = db.getTodayMax();
  const yesterdayMax = db.getYesterdayMax();
  res.json({ lastScrape: log || null, todayMax, yesterdayMax });
});

app.listen(PORT, () => {
  console.log(`[Server] Schumann Tracker běží na http://localhost:${PORT}`);
  scheduler.start();
});
