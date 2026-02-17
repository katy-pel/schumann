const API_BASE = 'https://uniqatlas.com/schumann_api.php';

let chart;
let chartRange = '24h';
let cachedData = null;

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

// Format number
function fmt(n, decimals = 2) {
  return n != null ? Number(n).toFixed(decimals) : '—';
}

// Translate trend
function trendText(trend) {
  if (trend === 'up') return '↑ stoupá';
  if (trend === 'down') return '↓ klesá';
  if (trend === 'stable') return '→ stabilní';
  return trend || '—';
}

// Translate clarity
function clarityText(clarity) {
  const map = {
    'mükemmel': 'vynikající',
    'çok iyi': 'velmi dobrá',
    'iyi': 'dobrá',
    'orta': 'průměrná',
    'zayıf': 'slabá',
    'excellent': 'vynikající',
    'very good': 'velmi dobrá',
    'good': 'dobrá',
    'average': 'průměrná',
    'poor': 'slabá',
  };
  return map[(clarity || '').toLowerCase()] || clarity || '—';
}

// Context text based on frequency + amplitude
function getContextText(freq, amp) {
  if (freq == null) return 'Žádná data';
  if (freq >= 8.5 || amp > 15) return 'Zvýšená aktivita Schumannovy rezonance';
  if (freq <= 7.5 && amp < 5) return 'Nízká aktivita, klidný stav';
  return 'Schumannova rezonance v normálním rozmezí';
}

// Load latest reading (lightweight endpoint)
async function loadLatest() {
  try {
    const res = await fetch(`${API_BASE}?action=latest`);
    const data = await res.json();

    document.getElementById('current-freq').textContent = fmt(data.main_frequency);
    document.getElementById('current-amp').textContent = fmt(data.amplitude);
    document.getElementById('context-text').textContent = getContextText(data.main_frequency, data.amplitude);

    // Update status
    const statusEl = document.getElementById('data-status');
    const dot = statusEl.querySelector('.dot');
    const text = statusEl.querySelector('.status-text');
    if (data.status === 'aktif') {
      dot.className = 'dot ok';
      const dateStr = new Date(data.timestamp * 1000).toLocaleString('cs-CZ');
      text.textContent = `Poslední aktualizace: ${dateStr}`;
    } else {
      dot.className = 'dot fail';
      text.textContent = 'API neaktivní';
    }
  } catch {
    document.getElementById('context-text').textContent = 'Nepodařilo se načíst data';
    const statusEl = document.getElementById('data-status');
    statusEl.querySelector('.dot').className = 'dot fail';
    statusEl.querySelector('.status-text').textContent = 'Chyba připojení k API';
  }
}

// Load full data (harmonics, stats, quality, chart)
async function loadData() {
  try {
    const res = await fetch(`${API_BASE}?action=data`);
    const data = await res.json();
    cachedData = data;

    // SR1 trend + power into header
    const sr1 = data.frequencies?.[0];
    if (sr1) {
      document.getElementById('current-trend').textContent = trendText(sr1.trend);
      document.getElementById('current-power').textContent = sr1.power != null ? sr1.power + ' %' : '—';
    }

    renderHarmonics(data.frequencies);
    renderStats(data.statistics);
    renderQuality(data.quality);
    renderChart(data.historical);
  } catch {
    document.getElementById('context-text').textContent = 'Nepodařilo se načíst data';
  }
}

// Harmonics grid
function renderHarmonics(frequencies) {
  const grid = document.getElementById('harmonics-grid');
  if (!frequencies?.length) {
    grid.innerHTML = '<p class="no-data">Žádná data</p>';
    return;
  }

  grid.innerHTML = frequencies.map(f => `
    <div class="harmonic-card">
      <div class="harmonic-id">${f.id}</div>
      <div class="harmonic-freq">${fmt(f.frequency)} <span class="unit-sm">Hz</span></div>
      <div class="harmonic-details">
        <span>Amp: ${fmt(f.amplitude)}</span>
        <span>Peak: ${fmt(f.peak)} Hz</span>
      </div>
      <div class="harmonic-meta">
        <span class="trend-badge trend-${f.trend}">${trendText(f.trend)}</span>
        <span class="power-badge">Výkon: ${f.power}%</span>
      </div>
    </div>
  `).join('');
}

// Statistics grid
function renderStats(stats) {
  const grid = document.getElementById('stats-grid');
  if (!stats) {
    grid.innerHTML = '<p class="no-data">Žádná data</p>';
    return;
  }

  const items = [
    { label: 'Průměrná frekvence', value: fmt(stats.average_frequency) + ' Hz' },
    { label: 'Max frekvence', value: fmt(stats.max_frequency) + ' Hz' },
    { label: 'Min frekvence', value: fmt(stats.min_frequency) + ' Hz' },
    { label: 'Rozsah', value: fmt(stats.frequency_range) + ' Hz' },
    { label: 'Celkový výkon', value: stats.total_power },
    { label: 'Průměrný výkon', value: fmt(stats.average_power) + ' %' },
    { label: 'Aktivní harmoniky', value: stats.active_harmonics },
    { label: 'Průměrná amplituda', value: fmt(stats.average_amplitude) },
    { label: 'Max amplituda', value: fmt(stats.max_amplitude) },
    { label: 'Stabilita harmonik', value: stats.harmonic_stability + ' %' },
  ];

  grid.innerHTML = items.map(i => `
    <div class="stat-item">
      <span class="stat-label">${i.label}</span>
      <span class="stat-value">${i.value}</span>
    </div>
  `).join('');
}

// Quality grid
function renderQuality(quality) {
  const grid = document.getElementById('quality-grid');
  if (!quality) {
    grid.innerHTML = '<p class="no-data">Žádná data</p>';
    return;
  }

  const items = [
    { label: 'Síla signálu', value: fmt(quality.signal_strength, 1) + ' %' },
    { label: 'Úroveň šumu', value: quality.noise_level + ' %' },
    { label: 'Čistota', value: clarityText(quality.clarity) + ' (' + fmt(quality.clarity_percentage, 1) + ' %)' },
    { label: 'SNR', value: fmt(quality.snr, 2) + ' dB' },
    { label: 'Stabilita', value: quality.stability + ' %' },
    { label: 'Kvalita přenosu', value: quality.transmission_quality + ' %' },
    { label: 'Interference', value: quality.interference_level + ' %' },
    { label: 'Síla příjmu', value: fmt(quality.reception_strength, 1) + ' %' },
    { label: 'Integrita dat', value: fmt(quality.data_integrity, 1) + ' %' },
    { label: 'Celkové skóre', value: fmt(quality.quality_score, 1) + ' %' },
  ];

  grid.innerHTML = items.map(i => `
    <div class="stat-item">
      <span class="stat-label">${i.label}</span>
      <span class="stat-value">${i.value}</span>
    </div>
  `).join('');
}

// Chart
function renderChart(historical) {
  if (!historical) return;

  const source = chartRange === '1h' ? historical.last_hour : historical.last_24h;
  if (!source?.length) return;

  const ctx = document.getElementById('chart').getContext('2d');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#98989d' : '#6e6e73';

  const labels = source.map(r => r.time);
  const freqData = source.map(r => r.frequency);
  const ampData = source.map(r => r.amplitude);

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
          pointRadius: source.length > 30 ? 0 : 3,
          yAxisID: 'y',
        },
        {
          label: 'Amplituda',
          data: ampData,
          borderColor: '#ff9f0a',
          backgroundColor: 'rgba(255,159,10,0.1)',
          fill: false,
          tension: 0.3,
          pointRadius: source.length > 30 ? 0 : 3,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          ticks: { color: textColor, maxTicksLimit: 12, maxRotation: 45 },
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

// Chart range toggle
document.querySelectorAll('.chart-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    chartRange = btn.dataset.range;
    if (cachedData?.historical) renderChart(cachedData.historical);
  });
});

// Refresh button
const btnRefresh = document.getElementById('btn-refresh');
btnRefresh.addEventListener('click', async () => {
  btnRefresh.disabled = true;
  btnRefresh.textContent = 'Načítám…';
  try {
    await Promise.all([loadLatest(), loadData()]);
  } finally {
    btnRefresh.disabled = false;
    btnRefresh.textContent = 'Obnovit data';
  }
});

// Initial load
Promise.all([loadLatest(), loadData()]);

// Auto-refresh every 5 minutes
setInterval(() => {
  Promise.all([loadLatest(), loadData()]);
}, 5 * 60 * 1000);
