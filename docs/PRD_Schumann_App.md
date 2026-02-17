# PRD -- Aplikace pro sledování Schumannovy frekvence

## 1. Résumé (One-pager)

Cílem je vytvořit interní webovou aplikaci pro sledování aktuální
hodnoty Schumannovy frekvence (peak) ze zdroje Meteoagent, která:

-   2× denně (10:00, 16:00 CET) provede scraping
-   uloží hodnoty (peak + denní maximum)
-   odešle Slack notifikaci (text + link)
-   zobrazí 30denní graf a tabulkovou historii
-   umožní ad-hoc měření přes tlačítko „Zjistit teď"

Produkt je určen primárně pro osobní použití, bez autentizace, bez sběru
osobních dat a bez medicínských doporučení.

------------------------------------------------------------------------

## 2. Problém & Kontext

Uživatel chce mít pravidelný přehled o aktuálním vývoji Schumannovy
frekvence bez nutnosti manuálně kontrolovat webové zdroje.

Kontext: - Interní osobní nástroj - Český jazyk - Jediný uživatel -
Zdroj dat nemá API → nutný scraping

------------------------------------------------------------------------

## 3. Cíle & KPI

### Hlavní cíl

Automatizovat sběr a zobrazování aktuální hodnoty Schumannovy frekvence
včetně kontextu.

### Definice úspěchu

-   Systém 2× denně úspěšně provede scraping
-   Slack notifikace obsahuje správná data
-   Dashboard zobrazuje aktuální hodnoty a 30denní historii

### KPI (technické)

-   Scraping \< 10 s (cílově)
-   Dashboard load \< 5 s
-   3× po sobě FAIL = incident

------------------------------------------------------------------------

## 4. Stakeholdeři & RACI

-   Product Owner: Uživatel
-   Finální schvalovatel: Uživatel
-   Vývoj: TBD
-   Hosting: TBD

------------------------------------------------------------------------

## 5. Persona

Interní uživatel: - Sleduje vývoj Schumannovy frekvence - Chce
automatické notifikace - Chce mít historický přehled 30 dní

------------------------------------------------------------------------

## 6. Use-casy

### UC1 -- Automatická notifikace

-   10:00 a 16:00 CET
-   Scraping
-   Uložení dat
-   Slack zpráva:
    -   aktuální peak
    -   denní maximum
    -   rozdíl oproti včerejšku
    -   krátký kontext
    -   odkaz na dashboard

### UC2 -- Ad-hoc měření

-   Klik na „Zjistit teď"
-   Live scraping
-   Uložení
-   Aktualizace dashboardu
-   Slack zpráva se neposílá

### UC3 -- Dashboard

Obsah: - Aktuální peak - Denní maximum - Rozdíl oproti včerejšku -
Kontextový text - 30denní graf - Stav posledního scrapu - Tlačítko
„Zjistit teď"

Tabulka historie (30 dní): - Datum - 10:00 hodnota - 16:00 hodnota -
Ad-hoc měření

------------------------------------------------------------------------

## 7. Scope (MoSCoW)

### MUST

-   Scraping peak + denní max
-   Ukládání dat (30 dní rolling)
-   Slack notifikace (text + link)
-   30denní graf
-   Tabulka historie
-   Ad-hoc měření
-   Status scrapu

### SHOULD

-   Přehledný vizuální design

### COULD

-   Nastavitelné časy
-   Delší historie

### WON'T

-   Více uživatelů
-   Autentizace
-   WhatsApp
-   Lékařská doporučení

------------------------------------------------------------------------

## 8. Funkční požadavky

1.  Systém musí scrapovat hodnoty ze zdroje Meteoagent.
2.  Systém musí ukládat timestamp, peak, denní max, flag
    (scheduled/adhoc).
3.  Retence: 30 dní.
4.  Generovat vlastní graf z uložených dat.
5.  Slack notifikace obsahuje text + link.
6.  Dashboard je bez loginu.

------------------------------------------------------------------------

## 9. Nefunkční požadavky

-   Scraping \< 10 s
-   Dashboard \< 5 s
-   Best effort dostupnost
-   3× FAIL = incident
-   Logujeme SUCCESS/FAIL + timestamp
-   Žádný backup
-   Slack webhook jako secret
-   Scraper endpoint neveřejný
-   n8n UI neveřejné

------------------------------------------------------------------------

## 10. Tracking

Evidované eventy: - scheduled_scrape - adhoc_scrape - fail_counter

Neevidujeme latenci ani uživatelská data.

------------------------------------------------------------------------

## 11. Rizika

-   Změna HTML → rozbití scrapingu
-   Dashboard bez loginu
-   Zdroj bez API

------------------------------------------------------------------------

## 12. Roadmapa (High-level)

1.  Implementace scraperu
2.  Datové úložiště + retence
3.  Generování grafu
4.  Dashboard
5.  Slack integrace
6.  Monitoring FAIL logiky
7.  Nasazení (hosting TBD)

------------------------------------------------------------------------

## 13. Akceptační kritéria (BDD)

Scheduled scrape: Given je 10:00 nebo 16:00\
When se spustí plánovaný scraping\
Then se uloží peak a denní max\
And odešle se Slack notifikace

Ad-hoc scrape: Given uživatel klikne na "Zjistit teď"\
When proběhne scraping\
Then se uloží nové hodnoty\
And dashboard se aktualizuje\
And Slack notifikace se neposílá

Incident: Given scraping selže 3× po sobě\
When dojde k třetímu FAIL\
Then je označen incident

------------------------------------------------------------------------

## 14. Otevřené otázky

-   Hosting (VPS vs PaaS) -- TBD
-   Finální text kontextové interpretace
