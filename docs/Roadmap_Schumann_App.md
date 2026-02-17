# Roadmap -- Aplikace pro sledování Schumannovy frekvence

## Přehled

Roadmapa definuje implementační fáze MVP verze aplikace podle
schváleného PRD.

------------------------------------------------------------------------

# FÁZE 1 -- Datová vrstva (Foundation)

## Cíl

Získávat a ukládat správná data ze zdroje (scraping).

## Obsah

-   Analýza HTML struktury zdroje
-   Implementace scraperu (peak + denní max)
-   Uložení do DB (timestamp, peak, max, type)
-   Retence 30 dní (automatické mazání starých dat)
-   Log SUCCESS/FAIL
-   Implementace fail_counter (3× FAIL = incident)

## Milník M1

-   Scraper běží lokálně
-   Data se ukládají
-   FAIL logika funguje

------------------------------------------------------------------------

# FÁZE 2 -- Vizualizace & Dashboard

## Cíl

Zobrazit data přehledně a umožnit ad-hoc měření.

## Obsah

-   API endpoint pro čtení dat
-   Generování 30denního grafu z uložených dat
-   Dashboard obsahující:
    -   aktuální peak
    -   denní maximum
    -   rozdíl oproti včerejšku
    -   kontextový text
    -   status scrapu
    -   tlačítko „Zjistit teď"
-   Tabulka historie (30 dní)
-   Implementace live ad-hoc scrapingu

## Milník M2

-   Dashboard zobrazuje správná data
-   Graf odpovídá uloženým hodnotám
-   Ad-hoc měření funguje

------------------------------------------------------------------------

# FÁZE 3 -- Slack integrace

## Cíl

Automatizované notifikace 2× denně.

## Obsah

-   n8n workflow (10:00 a 16:00 CET)
-   Trigger scraping endpointu
-   Odeslání Slack zprávy (text + link)
-   Testování formátu zprávy

## Milník M3

-   Slack zpráva chodí 2× denně
-   Obsahuje správná data
-   Odkaz na dashboard funguje

------------------------------------------------------------------------

# FÁZE 4 -- Stabilizace & Monitoring

## Cíl

Zvýšit stabilitu a ověřit chování při chybách.

## Obsah

-   Test FAIL scénáře
-   Ověření 3× FAIL incidentu
-   Kontrola logování
-   Ověření retence (mazání \>30 dní)
-   Základní hardening dle bezpečnostního návrhu

## Milník M4

-   Incident logika funguje
-   Retence funguje
-   n8n není veřejně dostupné

------------------------------------------------------------------------

# Kritická cesta

Scraper → Ukládání → Graf → Dashboard → Slack

Slack lze implementovat až po dokončení datové vrstvy.

------------------------------------------------------------------------

# Odhad implementace (1 vývojář)

  Fáze               Odhad
  ------------------ ----------
  F1 Datová vrstva   1--3 dny
  F2 Dashboard       2--4 dny
  F3 Slack           1 den
  F4 Stabilizace     1 den

Celkem: přibližně 5--9 pracovních dní (MVP).

------------------------------------------------------------------------

# Hosting (TBD)

Rozhodnutí o hostingu (VPS vs PaaS) bude doplněno před nasazením.
