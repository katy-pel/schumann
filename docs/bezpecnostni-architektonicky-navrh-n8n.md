# Bezpečnostní architektonický návrh -- n8n (Self‑Hosted)

## Cíl

Zajistit bezpečné provozování n8n pro osobní automatizace (WhatsApp
notifikace, scraping workflow) bez rizika převzetí serveru.

------------------------------------------------------------------------

# 1. Architektonický přehled

## Vrstva 1 -- Reverse Proxy + TLS

-   n8n běží interně (např. 127.0.0.1:5678 nebo Docker síť)
-   Veřejně dostupný je pouze reverse proxy (Nginx / Traefik / Caddy)
-   HTTPS (TLS certifikát -- např. Let's Encrypt)
-   Security headers + rate limiting

## Vrstva 2 -- Oddělení přístupů

-   Admin UI: dostupné pouze přes VPN nebo IP allowlist
-   Webhook endpointy: veřejné, ale chráněné API klíčem nebo HMAC
    podpisem

## Vrstva 3 -- Autentizace

-   Zapnutá vestavěná autentizace n8n
-   Doporučeno: VPN (Tailscale / WireGuard) pro přístup do UI
-   Možné doplnění o BasicAuth nebo SSO vrstvu

------------------------------------------------------------------------

# 2. Firewall konfigurace (VPS)

Otevřené porty: - 22/tcp (SSH) -- ideálně omezené na konkrétní IP nebo
VPN - 80/tcp (redirect + ACME) - 443/tcp (HTTPS)

Nikdy neotevírat: - 5678/tcp (n8n port)

Docker poznámka: - Nepublikovat port 5678 veřejně - Používat interní
Docker síť - Veřejný přístup pouze přes reverse proxy

------------------------------------------------------------------------

# 3. Webhook bezpečnost

Každý webhook musí: - Vyžadovat API key v headeru nebo - Ověřovat HMAC
podpis

Volitelné: - IP allowlist - Rate limiting

------------------------------------------------------------------------

# 4. n8n Konfigurace

-   Nastavit silný N8N_ENCRYPTION_KEY
-   Zapnout relevantní security environment variables
-   Pravidelně aktualizovat n8n (patch ASAP)
-   Neukládat secrets do GitHub repozitáře

------------------------------------------------------------------------

# 5. Monitoring & Hardening

-   Fail2ban nebo ekvivalent proti brute-force
-   Log monitoring
-   Pravidelné zálohy databáze (šifrovaně)
-   Oddělené prostředí (Docker container nebo izolovaný VM)

------------------------------------------------------------------------

# 6. Secure-by-default provozní pravidla

-   UI přístup jen pro administrátora
-   Žádné veřejné testovací endpointy
-   Minimální oprávnění (princip least privilege)
-   Pravidelná kontrola otevřených portů

------------------------------------------------------------------------

# 7. Shrnutí bezpečnostní politiky

-   n8n UI není veřejně dostupné
-   Veřejné webhooky jsou autentizované
-   Vše běží přes HTTPS
-   Server je chráněn firewallem
-   n8n je pravidelně aktualizováno
-   Secrets jsou bezpečně uložené

------------------------------------------------------------------------

Tento dokument definuje minimální bezpečnostní standard pro
self‑hostování n8n v rámci osobního projektu.
