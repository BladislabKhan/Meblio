# Deployment

## GitHub

1. Создайте новый репозиторий.
2. Загрузите в него содержимое папки `furniora-site`.
3. Сохраните служебные файлы: `.gitignore`, `README.md`, `LICENSE`, `_headers`, `_redirects`, `robots.txt`, `sitemap.xml`, `.nojekyll`.

## GitHub Pages

Проект можно опубликовать и как обычный статический сайт.

1. Загрузите проект в репозиторий.
2. Включите GitHub Pages для ветки с проектом.
3. Публикуйте корень проекта без build step.
4. Учитывайте, что Cloudflare Functions в GitHub Pages не работают, поэтому заявка и аналитика будут работать в локальном режиме браузера.

## Cloudflare Pages

1. Подключите репозиторий к Cloudflare Pages.
2. Build command: пусто.
3. Build output directory: `.`.
4. Включите Pages Functions.

## Переменные и привязки для Cloudflare

Задайте:

- `TURNSTILE_SECRET_KEY`
- `LEADS_WEBHOOK_URL` при необходимости
- `LEAD_MIN_FILL_MS`, например `3000`
- `TWOGIS_API_KEY` для более точного рейтинга 2ГИС

Для серверной аналитики создайте KV namespace и привяжите его как:

- binding: `ANALYTICS`

## После публикации

1. Замените `https://example.com` в `robots.txt` и `sitemap.xml` на реальный домен.
2. Заполните `security.turnstileSiteKey` в `app/js/site-config.js`, если используете Turnstile.
3. Проверьте работу `index.html`, `admin.html`.
4. Если сайт развёрнут без Cloudflare Functions, используйте локальный режим заявок и аналитики.
