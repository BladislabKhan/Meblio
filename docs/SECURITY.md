# Security

## Что уже включено

- CSP и защитные заголовки через `_headers`;
- `noindex` для страницы входа;
- honeypot, минимальное время заполнения и cooldown формы;
- поддержка Cloudflare Turnstile;
- серверная обработка заявок через `functions/api/lead.js`;
- серверная аналитика через `functions/api/metrics.js`;
- серверный рейтинг QR-блоков через `functions/api/rating.js`;
- ограничение попыток входа;
- срок жизни сессии входа.

## Важно понимать

Проверка логина и пароля выполняется в браузере. Серверной проверки учётных данных в этом проекте нет.

## Что рекомендуется включить в Cloudflare

- Bot Fight Mode
- WAF Managed Rules
- Rate Limiting для `/api/lead` и `/api/metrics`
- Always Use HTTPS
- Brotli
- Auto Minify