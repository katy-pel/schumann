const cron = require('node-cron');
const scraper = require('./scraper');
const db = require('./db');
const slack = require('./slack');

async function runScheduledScrape() {
  console.log(`[Scheduler] Spouštím plánovaný scrape: ${new Date().toISOString()}`);
  try {
    const data = await scraper.fetchData();
    db.insertMeasurement(data, 'scheduled');
    db.logScrape('scheduled', 'success');
    db.cleanOldData();

    const todayMax = db.getTodayMax();
    const yesterdayMax = db.getYesterdayMax();
    await slack.sendNotification(data, todayMax, yesterdayMax);

    console.log(`[Scheduler] Scrape úspěšný: ${data.main_frequency} Hz`);
  } catch (err) {
    console.error('[Scheduler] Scrape selhal:', err.message);
    db.logScrape('scheduled', 'fail', err.message);

    const failCount = db.getRecentFailCount();
    if (failCount >= 3) {
      console.error('[Scheduler] INCIDENT: 3 po sobě jdoucí selhání!');
    }
  }
}

function start() {
  // 10:00 CET = 09:00 UTC (winter) / 08:00 UTC (summer)
  // 16:00 CET = 15:00 UTC (winter) / 14:00 UTC (summer)
  // Using system timezone — assumes CET/CEST on the machine
  cron.schedule('0 10 * * *', runScheduledScrape);
  cron.schedule('0 16 * * *', runScheduledScrape);

  console.log('[Scheduler] Cron naplánován: 10:00 a 16:00 systémový čas');
}

module.exports = { start, runScheduledScrape };
