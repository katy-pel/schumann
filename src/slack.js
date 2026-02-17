const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

function formatMessage(data, todayMax, yesterdayMax) {
  const freq = data.main_frequency;
  const amp = data.amplitude;

  let context;
  if (freq >= 8.5 || amp > 15) {
    context = 'Zvýšená aktivita Schumannovy rezonance';
  } else if (freq <= 7.5 && amp < 5) {
    context = 'Nízká aktivita, klidný stav';
  } else {
    context = 'Schumannova rezonance v normálním rozmezí';
  }

  let diff = '';
  if (yesterdayMax?.max_frequency != null && todayMax?.max_frequency != null) {
    const delta = todayMax.max_frequency - yesterdayMax.max_frequency;
    const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
    diff = `\nDenní max: ${todayMax.max_frequency.toFixed(2)} Hz (${arrow} ${Math.abs(delta).toFixed(2)} Hz oproti včerejšku)`;
  }

  return {
    text: `*Schumann Resonance Update*\n`
      + `Frekvence: *${freq.toFixed(2)} Hz* | Amplituda: *${amp.toFixed(2)}*\n`
      + `${context}${diff}\n`
      + `<http://localhost:3000|Otevřít dashboard>`,
  };
}

async function sendNotification(data, todayMax, yesterdayMax) {
  if (!WEBHOOK_URL) {
    console.log('[Slack] Webhook URL nenastavena, přeskakuji notifikaci');
    return false;
  }

  const body = formatMessage(data, todayMax, yesterdayMax);

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Slack HTTP ${res.status}`);
    console.log('[Slack] Notifikace odeslána');
    return true;
  } catch (err) {
    console.error('[Slack] Chyba:', err.message);
    return false;
  }
}

module.exports = { sendNotification };
