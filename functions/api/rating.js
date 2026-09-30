const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store"
};

const ALLOWED_HOSTS = new Set([
  "yandex.ru",
  "www.yandex.ru",
  "yandex.com",
  "www.yandex.com",
  "yandex.eu",
  "www.yandex.eu",
  "2gis.ru",
  "www.2gis.ru",
  "2gis.com",
  "www.2gis.com"
]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function normalizePlatform(value) {
  const platform = String(value || "").trim().toLowerCase();
  if (platform === "yandex" || platform === "2gis") {
    return platform;
  }
  return "";
}

function normalizeRating(value) {
  const rating = Number(String(value || "").replace(",", "."));
  if (!Number.isFinite(rating) || rating <= 0) return null;
  return Math.round(rating * 10) / 10;
}

function normalizeCount(value) {
  const count = Number(String(value || "").replace(/[^\d]/g, ""));
  if (!Number.isFinite(count) || count < 0) return null;
  return Math.round(count);
}

function normalizePublicUrl(url, platform) {
  const normalized = new URL(url);

  if (platform === "yandex") {
    normalized.hostname = "yandex.com";
    normalized.protocol = "https:";
  }

  return normalized.toString();
}

function extractByPatterns(source, patterns, normalizer) {
  for (const pattern of patterns) {
    const match = source.match(pattern);
    const value = normalizer(match && match.groups ? match.groups.value : "");
    if (value !== null) {
      return value;
    }
  }

  return null;
}

function extractStatsFromHtml(html, platform) {
  const source = String(html || "");

  const ratingPatterns =
    platform === "2gis"
      ? [
          /"ratingValue"\s*:\s*"?(?<value>\d+(?:[.,]\d+)?)"?/i,
          /"general_rating"\s*:\s*"?(?<value>\d+(?:[.,]\d+)?)"?/i,
          /"rating"\s*:\s*"?(?<value>\d+(?:[.,]\d+)?)"?/i,
          /(?:^|\s)(?<value>\d+(?:[.,]\d+)?)\s*\n\s*(?:\d+\s*оцен(?:ок|ки|ка)|Отзывы\s*\d+)/im
        ]
      : [
          /"ratingValue"\s*:\s*"?(?<value>\d+(?:[.,]\d+)?)"?/i,
          /"rating"\s*:\s*"?(?<value>\d+(?:[.,]\d+)?)"?/i,
          /"ratingData"\s*:\s*\{[^}]*"rating"\s*:\s*"?(?<value>\d+(?:[.,]\d+)?)"?/i,
          /Rating\s*(?<value>\d+(?:[.,]\d+)?)/i
        ];

  const reviewCountPatterns =
    platform === "2gis"
      ? [
          /(?:Отзывы|отзывы)\s*(?<value>\d+)/i,
          /(?<value>\d+)\s+отзыв(?:ов|а)?/i,
          /"reviewCount"\s*:\s*"?(?<value>\d+)"?/i,
          /"count"\s*:\s*"?(?<value>\d+)"?[^}]*"rating/i
        ]
      : [
          /##\s*(?<value>\d+)\s+reviews/i,
          /(?<value>\d+)\s+reviews/i,
          /Reviews\s*(?<value>\d+)/i,
          /"reviewCount"\s*:\s*"?(?<value>\d+)"?/i,
          /"reviews"\s*:\s*\{[^}]*"count"\s*:\s*"?(?<value>\d+)"?/i
        ];

  const ratingsCountPatterns =
    platform === "2gis"
      ? [
          /(?<value>\d+)\s+оцен(?:ок|ки|ка)/i,
          /"ratingCount"\s*:\s*"?(?<value>\d+)"?/i
        ]
      : [
          /(?<value>\d+)\s+ratings/i,
          /"ratingCount"\s*:\s*"?(?<value>\d+)"?/i
        ];

  let reviewCount = extractByPatterns(source, reviewCountPatterns, normalizeCount);
  let ratingsCount = extractByPatterns(source, ratingsCountPatterns, normalizeCount);

  if (platform === "yandex" && /No reviews yet/i.test(source)) {
    reviewCount = 0;
  }

  if (platform === "2gis" && /Отзывы\s*$/im.test(source) && reviewCount === null) {
    reviewCount = 0;
  }

  return {
    rating: extractByPatterns(source, ratingPatterns, normalizeRating),
    reviewCount,
    ratingsCount
  };
}

function extract2GisFirmId(url) {
  const match = url.match(/\/firm\/(\d+)/i);
  return match ? match[1] : "";
}

function extract2GisStatsFromApiPayload(data) {
  const reviews =
    data && data.result && Array.isArray(data.result.items) && data.result.items[0]
      ? data.result.items[0].reviews || null
      : null;

  if (!reviews) return null;

  const rating = normalizeRating(reviews.rating);
  const reviewCount = normalizeCount(reviews.count || reviews.review_count || reviews.reviews_count || reviews.total_count);

  if (rating === null && reviewCount === null) return null;

  return {
    rating,
    reviewCount,
    ratingsCount: reviewCount
  };
}

async function fetch2GisStatsFromApi(url, env) {
  const apiKey = String(env.TWOGIS_API_KEY || "").trim();
  const firmId = extract2GisFirmId(url);
  if (!apiKey || !firmId) return null;

  const response = await fetch(
    "https://catalog.api.2gis.com/3.0/items/byid?id=" +
      encodeURIComponent(firmId) +
      "&fields=items.reviews&key=" +
      encodeURIComponent(apiKey),
    {
      headers: {
        Accept: "application/json"
      }
    }
  );

  if (!response.ok) return null;
  const data = await response.json().catch(() => null);
  return extract2GisStatsFromApiPayload(data);
}

async function fetchPublicPage(url, platform) {
  const response = await fetch(normalizePublicUrl(url, platform), {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MebelAtelierBot/1.1; +https://example.com)"
    }
  });

  if (!response.ok) {
    throw new Error("Не удалось получить страницу организации.");
  }

  return response.text();
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  const platform = normalizePlatform(searchParams.get("platform"));
  const targetUrl = String(searchParams.get("url") || "").trim();

  if (!platform || !targetUrl) {
    return json({ error: "Не хватает параметров platform или url." }, 400);
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (error) {
    return json({ error: "Некорректная ссылка организации." }, 400);
  }

  if (!ALLOWED_HOSTS.has(parsedUrl.hostname)) {
    return json({ error: "Источник рейтинга не разрешён." }, 403);
  }

  try {
    let stats = null;

    if (platform === "2gis") {
      stats = await fetch2GisStatsFromApi(targetUrl, env);
      if (stats) {
        return json({
          ok: true,
          platform,
          rating: stats.rating,
          reviewCount: stats.reviewCount,
          ratingsCount: stats.ratingsCount,
          source: "2gis-api"
        });
      }
    }

    const html = await fetchPublicPage(targetUrl, platform);
    stats = extractStatsFromHtml(html, platform);
    if (stats.rating === null && stats.reviewCount === null && stats.ratingsCount === null) {
      return json({ error: "Не удалось найти рейтинг или количество отзывов на странице организации." }, 404);
    }

    return json({
      ok: true,
      platform,
      rating: stats.rating,
      reviewCount: stats.reviewCount,
      ratingsCount: stats.ratingsCount,
      source: "public-page"
    });
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : "Не удалось получить рейтинг."
      },
      502
    );
  }
}
