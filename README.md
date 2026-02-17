# Schumann Resonance Tracker

Osobní dashboard pro sledování Schumannovy rezonance (~7.83 Hz). Aplikace stahuje data z [UniqAtlas API](https://uniqatlas.com), ukládá je do lokální SQLite databáze a zobrazuje je v přehledném webovém rozhraní.

## Funkce

- **Aktuální frekvence a amplituda** — hlavní panel s kontextovým popisem aktivity
- **Graf posledních 30 dní** — frekvence a amplituda na dvou osách (Chart.js)
- **Tabulka historie** — všechna měření s rozlišením plánovaných a ad-hoc
- **Automatický scraping** — cron v 10:00 a 16:00 (systémový čas)
- **Ruční scrape** — tlačítko "Zjistit teď" pro okamžité stažení dat
- **Slack notifikace** — volitelné upozornění přes webhook po každém scrapingu
- **Dark mode** — přepínání světlého/tmavého motivu
- **Auto-refresh** — dashboard se obnovuje každých 5 minut

## Požadavky

- Node.js 18+

## Instalace

```bash
git clone https://github.com/katy-pel/schumann.git
cd schumann
npm install
```

## Konfigurace

Zkopírujte `.env.example` do `.env` a upravte dle potřeby:

```bash
cp .env.example .env
```

| Proměnná | Popis | Výchozí |
|---|---|---|
| `PORT` | Port serveru | `3000` |
| `SLACK_WEBHOOK_URL` | Slack webhook pro notifikace (volitelné) | — |

## Spuštění

```bash
npm start
```

Aplikace poběží na [http://localhost:3000](http://localhost:3000).

## Struktura projektu

```
schumann/
├── server.js           # Express server + API endpointy
├── src/
│   ├── db.js           # SQLite databáze (better-sqlite3)
│   ├── scraper.js      # Stahování dat z UniqAtlas API
│   ├── scheduler.js    # Cron plánování scrapů
│   └── slack.js        # Slack webhook notifikace
├── public/
│   ├── index.html      # Dashboard UI
│   ├── app.js          # Frontend logika + Chart.js
│   └── style.css       # Styly (light/dark theme)
├── data/               # SQLite databáze (gitignored)
└── docs/               # PRD, roadmapa, risk matrix
```

## API

| Metoda | Endpoint | Popis |
|---|---|---|
| GET | `/api/latest` | Poslední měření |
| GET | `/api/history` | Historie za posledních 30 dní |
| POST | `/api/scrape` | Spustit ad-hoc scrape |
| GET | `/api/status` | Stav posledního scrapu + denní maxima |

## Licence

ISC
