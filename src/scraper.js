const BASE_URL = 'https://uniqatlas.com/schumann_api.php';
const TIMEOUT_MS = 10_000;

async function fetchWithRetry(url, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function fetchLatest() {
  return fetchWithRetry(`${BASE_URL}?action=latest`);
}

async function fetchData() {
  return fetchWithRetry(`${BASE_URL}?action=data`);
}

module.exports = { fetchLatest, fetchData };
