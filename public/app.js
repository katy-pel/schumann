let chart;

// Theme
const themeBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
  if (chart) updateChartTheme();
});

// Context text based on frequency + amplitude
function getContextText(freq, amp) {
  if (freq == null) return 'Žádná data';
  if (freq >= 8.5 || amp > 15) return 'Zvýšená aktivita Schumannovy rezonance';
  if (freq <= 7.5 && amp < 5) return 'Nízká aktivita, klidný stav';
  return 'Schumannova rezonance v normálním rozmezí';
}

// Format number
function fmt(n, decimals = 2) {
  return n != null ? Number(n).toFixed(decimals) : '—';
}

// Load latest measurement
async function loadLatest() {
  try {
    const res = await fetch('/api/latest');
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    document.getElementById('current-freq').textContent = fmt(data.main_frequency);
    document.getElementById('current-amp').textContent = fmt(data.amplitude);
    document.getElementById('current-trend').textContent = data.trend || '—';
    document.getElementById('context-text').textContent = getContextText(data.main_frequency, data.amplitude);
  } catch {
    document.getElementById('context-text').textContent = 'Nepodařilo se načíst data';
  }
}

// Load status (today max, yesterday comparison)
async function loadStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();

    // Scrape status
    const statusEl = document.getElementById('scrape-status');
    const dot = statusEl.querySelector('.dot');
    const text = statusEl.querySelector('.status-text');

    if (data.lastScrape) {
      const date = new Date(data.lastScrape.timestamp * 1000);
      const timeStr = date.toLocaleString('cs-CZ');
      dot.className = 'dot ' + (data.lastScrape.status === 'success' ? 'ok' : 'fail');
      text.textContent = `Poslední scrape: ${timeStr} (${data.lastScrape.status})`;
    } else {
      text.textContent = 'Zatím žádný scrape';
    }

    // Today max + delta
    if (data.todayMax?.max_frequency != null) {
      document.getElementById('today-max').textContent = fmt(data.todayMax.max_frequency);

      if (data.yesterdayMax?.max_frequency != null) {
        const delta = data.todayMax.max_frequency - data.yesterdayMax.max_frequency;
        const deltaEl = document.getElementById('delta-yesterday');
        const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
        deltaEl.textContent = `${arrow} ${Math.abs(delta).toFixed(2)}`;
        deltaEl.className = 'delta ' + (delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat');
      }
    }
  } catch {
    // silently ignore
  }
}

// Load history + render chart + table
async function loadHistory() {
  try {
    const res = await fetch('/api/history');
    const rows = await res.json();

    renderChart(rows);
    renderTable(rows);
  } catch {
    // silently ignore
  }
}

function renderChart(rows) {
  const ctx = document.getElementById('chart').getContext('2d');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#98989d' : '#6e6e73';

  const labels = rows.map(r => `${r.date} ${r.time}`);
  const freqData = rows.map(r => r.main_frequency);
  const ampData = rows.map(r => r.amplitude);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Frekvence (Hz)',
          data: freqData,
          borderColor: '#0071e3',
          backgroundColor: 'rgba(0,113,227,0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: rows.length > 60 ? 0 : 3,
          yAxisID: 'y',
        },
        {
          label: 'Amplituda',
          data: ampData,
          borderColor: '#ff9f0a',
          backgroundColor: 'rgba(255,159,10,0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: rows.length > 60 ? 0 : 3,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          ticks: { color: textColor, maxTicksLimit: 10, maxRotation: 45 },
          grid: { color: gridColor },
        },
        y: {
          position: 'left',
          title: { display: true, text: 'Hz', color: textColor },
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
        y1: {
          position: 'right',
          title: { display: true, text: 'Amplituda', color: textColor },
          ticks: { color: textColor },
          grid: { display: false },
        },
      },
      plugins: {
        legend: { labels: { color: textColor } },
      },
    },
  });
}

function updateChartTheme() {
  if (!chart) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#98989d' : '#6e6e73';

  chart.options.scales.x.ticks.color = textColor;
  chart.options.scales.x.grid.color = gridColor;
  chart.options.scales.y.ticks.color = textColor;
  chart.options.scales.y.title.color = textColor;
  chart.options.scales.y.grid.color = gridColor;
  chart.options.scales.y1.ticks.color = textColor;
  chart.options.scales.y1.title.color = textColor;
  chart.options.plugins.legend.labels.color = textColor;
  chart.update();
}

function renderTable(rows) {
  const tbody = document.querySelector('#history-table tbody');
  // Show most recent first
  const sorted = [...rows].reverse();
  tbody.innerHTML = sorted.map(r => `
    <tr>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${fmt(r.main_frequency)}</td>
      <td>${fmt(r.amplitude)}</td>
      <td><span class="type-badge ${r.type}">${r.type === 'scheduled' ? 'plán' : 'ad-hoc'}</span></td>
    </tr>
  `).join('');
}

// Ad-hoc scrape button
const btnScrape = document.getElementById('btn-scrape');
btnScrape.addEventListener('click', async () => {
  btnScrape.disabled = true;
  btnScrape.textContent = 'Načítám…';
  try {
    const res = await fetch('/api/scrape', { method: 'POST' });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    // Refresh everything
    await Promise.all([loadLatest(), loadStatus(), loadHistory()]);
  } catch (err) {
    alert('Chyba: ' + err.message);
  } finally {
    btnScrape.disabled = false;
    btnScrape.textContent = 'Zjistit teď';
  }
});

// Initial load
Promise.all([loadLatest(), loadStatus(), loadHistory()]);

// Auto-refresh every 5 minutes
setInterval(() => {
  Promise.all([loadLatest(), loadStatus(), loadHistory()]);
}, 5 * 60 * 1000);
