# Risk Matrix -- Aplikace pro sledování Schumannovy frekvence

## Metodika

Rizika jsou hodnocena podle:

-   Pravděpodobnost (P): Nízká / Střední / Vysoká
-   Dopad (D): Nízký / Střední / Vysoký
-   Priorita: kombinace P × D

------------------------------------------------------------------------

## Přehled rizik

  ---------------------------------------------------------------------------------
  ID      Riziko          P         D         Priorita           Mitigace
  ------- --------------- --------- --------- ------------------ ------------------
  R1      Změna HTML      Střední   Vysoký    Vysoká             Oddělit parser do
          struktury                                              samostatné vrstvy,
          zdroje →                                               snadná úprava
          rozbití                                                selektorů
          scrapingu                                              

  R2      Zdroj           Střední   Střední   Střední            FAIL logika +
          nedostupný                                             incident po 3×
          (výpadek webu)                                         FAIL

  R3      Slack webhook   Nízká     Střední   Střední            Uložit jako
          kompromitován                                          secret,
                                                                 necommitovat do
                                                                 repozitáře

  R4      n8n instance    Nízká     Vysoký    Vysoká             Hostovat za VPN /
          veřejně                                                neveřejně
          dostupná                                               

  R5      Dashboard       Střední   Nízký     Nízká              URL neveřejná,
          veřejně                                                minimální
          přístupný                                              citlivost dat

  R6      Nesprávná       Nízká     Střední   Nízká              Udržovat formulace
          interpretace                                           jako informativní,
          zdravotního                                            bez doporučení
          kontextu                                               

  R7      Chybný výpočet  Nízká     Střední   Nízká              Jednotkové testy
          rozdílu oproti                                         logiky porovnání
          včerejšku                                              

  R8      Selhání retence Nízká     Nízký     Nízká              Jednoduchý cron
          (neodstraňují                                          test + kontrola
          se stará data)                                         tabulky
  ---------------------------------------------------------------------------------

------------------------------------------------------------------------

## Kritická rizika

### R1 -- Změna HTML struktury

Největší technické riziko. Scraping je závislý na externím webu bez API.

### R4 -- n8n bezpečnost

Při špatném nastavení může dojít k bezpečnostnímu incidentu na serveru.

------------------------------------------------------------------------

## Rizika mimo scope

-   Škálování na více uživatelů
-   GDPR / ochrana osobních údajů (nejsou zpracovávána osobní data)
-   Finanční ztráta (nejde o komerční produkt)

------------------------------------------------------------------------

## Doporučení

Nejvyšší prioritu má: 1. Stabilita scraperu 2. Bezpečné nastavení n8n 3.
Monitoring FAIL scénářů

------------------------------------------------------------------------

Dokument je součástí projektové dokumentace k PRD.
