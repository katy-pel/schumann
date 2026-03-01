# Průzkum datových zdrojů pro Schumannovu rezonanci

**Datum průzkumu:** 2026-03-01
**Důvod:** Ztráta konektivity na primární API (`uniqatlas.com`) — prošetřeno, šlo o dočasný výpadek.

---

## Primární datový zdroj: UniqAtlas API

**Stav (k 2026-03-01): FUNKČNÍ**

| Parametr | Hodnota |
|---|---|
| Base URL | `https://uniqatlas.com/schumann_api.php` |
| Endpoint `?action=latest` | Aktuální hodnota SR1 |
| Endpoint `?action=data` | Všech 5 harmonik + statistiky + posledních 60 min |
| Autentizace | Žádná |
| Formát | JSON |
| Zdroj dat | Space Observing System, Tomsk, Rusko (TSU) |

### Ukázka odpovědi `?action=latest`

```json
{
  "timestamp": 1772399864,
  "date": "2026-03-01 21:17:44",
  "main_frequency": 8.13,
  "amplitude": 8.3,
  "status": "active"
}
```

### Ukázka odpovědi `?action=data`

```json
{
  "timestamp": 1772399891,
  "date": "2026-03-01 21:18:11",
  "status": "active",
  "frequencies": [
    { "id": "SR1", "name": "Fundamental Frequency (SR1)", "frequency": 8.13, "amplitude": 8.23, "peak": 8.22, "trend": "up", "power": 89 },
    { "id": "SR2", "name": "Second Harmonic (SR2)", "frequency": 14.54, "amplitude": 7.02, "peak": 13.94, "trend": "up", "power": 73 },
    { "id": "SR3", "name": "Third Harmonic (SR3)", "frequency": 20.67, "amplitude": 11.54, "peak": 21.17, "trend": "down", "power": 65 },
    { "id": "SR4", "name": "Fourth Harmonic (SR4)", "frequency": 27.88, "amplitude": 19.61, "peak": 27.09, "trend": "up", "power": 56 },
    { "id": "SR5", "name": "Fifth Harmonic (SR5)", "frequency": 33.72, "amplitude": 13.02, "peak": 33.49, "trend": "down", "power": 48 }
  ],
  "statistics": {
    "average_frequency": 20.99,
    "max_frequency": 33.72,
    "min_frequency": 8.13,
    "total_power": 331,
    "average_power": 66.2,
    "active_harmonics": 5,
    "average_amplitude": 11.88,
    "harmonic_stability": 60
  },
  "quality": {
    "signal_strength": 80.2,
    "clarity": "good",
    "snr": 16.04
  },
  "station": {
    "name": "Space Observing System",
    "location": "Tomsk, Russia",
    "coordinates": { "lat": 56.4977, "lon": 84.9744 }
  },
  "historical": {
    "last_hour": [
      { "timestamp": 1772396291, "time": "20:18", "frequency": 8.36, "amplitude": 15.39 }
    ]
  }
}
```

---

## Prohledané alternativní zdroje

### NOAA SWPC — `services.swpc.noaa.gov`

- **Co nabízí:** K-index, geomagnetická aktivita, sluneční vítr, DST index
- **API:** ✅ JSON endpointy, bez autentizace, veřejné
- **Relevantní endpointy:**
  - `https://services.swpc.noaa.gov/json/noaa-planetary-k-index.json` — planetární K-index
  - `https://services.swpc.noaa.gov/products/kyoto-dst.json` — DST index
  - `https://services.swpc.noaa.gov/products/noaa-scales.json` — přehled úrovní aktivity
- **Schumannova rezonance přímo:** ❌ Neposkytuje — pouze geomagnetická data jako kontext
- **Hodnocení:** Vhodný jako **doplňkový zdroj** (korelace SR s geomagnetickou aktivitou)

### MeteoAgent — `api.meteoagent.com`

- **Endpoint:** `https://api.meteoagent.com/widgets/v1/kindex`
- **Co nabízí:** Kategorie Schumann (H = high / n = normal / N/A), K-index, solární aktivita
- **Formát:** HTML widget (ne JSON)
- **Číselné hodnoty Hz:** ❌ Neposkytuje — jen kategorie
- **Hodnocení:** ❌ Pro aplikaci **nevhodný** (chybí numerická data)

### GeoCenter.info — `geocenter.info/en/monitoring/schumann`

- **Co nabízí:** Grafy frekvence, amplitudy a Q-faktoru ze stanice v Tomsku (UTC+7)
- **API/JSON:** ❌ Pouze vizualizace — žádný programatický přístup
- **Hodnocení:** ❌ Nelze použít jako datový zdroj

### HeartMath Institute GCI — `heartmath.org/gci/gcms/live-data/`

- **Co nabízí:** SR Power spektrum 0.32–36 Hz, aktualizace každou hodinu
- **API/JSON:** ❌ Pouze webové rozhraní
- **Hodnocení:** ❌ Nelze použít jako datový zdroj

### Space Observing System Tomsk — `sos70.ru` (dříve `sosrff.tsu.ru`)

- **Co nabízí:** Sonogram (spektrogram) amplitudy ELF v rozsahu do 40 Hz, 3 dny zpět
- **Formát:** Obrázek JPG (`shm.jpg`)
- **API/JSON:** ❌ Žádný
- **Poznámka:** Toto je **fyzická stanice**, jejíž data agreguje UniqAtlas API
- **Hodnocení:** ❌ Přímo nevyužitelný, ale relevantní jako původní zdroj dat

### schumann-resonance.earth

- **Co nabízí:** Historické grafy ze stanice TSU (Tomsk)
- **API/JSON:** ❌ Žádný; provoz pozastaven kvůli změně přístupové politiky TSU
- **Hodnocení:** ❌ Nelze použít

---

## Srovnávací tabulka

| Zdroj | SR data | Číselné hodnoty | API/JSON | Vhodnost |
|---|---|---|---|---|
| **UniqAtlas** (primární) | ✅ | ✅ Hz + amplituda | ✅ | ✅ Primární |
| NOAA SWPC | Nepřímo (K-index) | ✅ | ✅ | Doplňkový |
| MeteoAgent | Kategorie | ❌ | ❌ (HTML) | ❌ |
| GeoCenter.info | ✅ | ✅ (vizuálně) | ❌ | ❌ |
| HeartMath GCI | ✅ | ✅ (vizuálně) | ❌ | ❌ |
| sos70.ru | ✅ | ✅ (vizuálně) | ❌ | ❌ |

---

## Doporučení pro případ výpadku UniqAtlas API

Pokud dojde k opakovanému výpadku primárního API:

1. **Krátkodobý výpadek** — stávající `getRecentFailCount()` logika zachytí 3× po sobě selháme a označí incident. Vyčkat a opakovat.

2. **Dlouhodobý výpadek** — v době průzkumu (2026-03) **neexistuje** volně přístupný JSON zdroj s číselnou hodnotou Schumannovy frekvence a amplitudy. Možnosti:
   - Kontaktovat provozovatele `sos70.ru` (TSU, Tomsk) s žádostí o přímý datový přístup
   - Kontaktovat provozovatele `schumannresonancedata.com` ohledně API přístupu
   - Implementovat scraping ze stránky `geocenter.info` (pozor: změna HTML = rozbití scrapingu)

3. **NOAA K-index jako záloha** — technicky dostupný, ale sleduje geomagnetickou aktivitu, ne přímo SR. Lze použít jako kontextový ukazatel, pokud chybí SR data.
