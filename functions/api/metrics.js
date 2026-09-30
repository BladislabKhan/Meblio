const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store"
};

const METRICS_KEY = "site-metrics";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function getDefaultMetrics() {
  return {
    totalVisits: 0,
    uniqueVisitors: 0,
    sessions: 0,
    leadsSubmitted: 0,
    lastVisitAt: "",
    lastLeadAt: "",
    visitors: [],
    sessionsList: [],
    pageViews: {},
    sources: {},
    devices: {}
  };
}

async function loadMetrics(env) {
  if (!env.ANALYTICS) {
    throw new Error("ANALYTICS binding is not configured.");
  }

  const raw = await env.ANALYTICS.get(METRICS_KEY, "json");
  return raw ? { ...getDefaultMetrics(), ...raw } : getDefaultMetrics();
}

async function saveMetrics(env, metrics) {
  await env.ANALYTICS.put(METRICS_KEY, JSON.stringify(metrics));
  return metrics;
}

function normalizeText(value, maxLength) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function incrementBucket(metrics, bucketName, key) {
  if (!metrics[bucketName] || typeof metrics[bucketName] !== "object" || Array.isArray(metrics[bucketName])) {
    metrics[bucketName] = {};
  }
  const safeKey = normalizeText(key, 120) || "Не определено";
  metrics[bucketName][safeKey] = (Number(metrics[bucketName][safeKey]) || 0) + 1;
}

function getPageLabel(pageUrl) {
  try {
    const url = new URL(pageUrl);
    return (url.pathname.replace(/\/index\.html$/, "/") || "/") + (url.hash || "");
  } catch (error) {
    return "/";
  }
}

function getSourceLabel(referrer, pageUrl) {
  if (!referrer) return "Прямой заход";
  try {
    const referrerUrl = new URL(referrer);
    const page = new URL(pageUrl);
    if (referrerUrl.host === page.host) return "Внутренние переходы";
    return referrerUrl.host;
  } catch (error) {
    return "Внешний источник";
  }
}

function getDeviceLabel(userAgent) {
  const value = String(userAgent || "");
  if (/tablet|ipad|playbook|silk/i.test(value)) return "Планшеты";
  if (/mobile|iphone|ipod|android/i.test(value)) return "Телефоны";
  return "Компьютеры";
}

export async function onRequestGet(context) {
  try {
    const metrics = await loadMetrics(context.env);
    return json({
      totalVisits: Number(metrics.totalVisits) || 0,
      uniqueVisitors: Number(metrics.uniqueVisitors) || 0,
      sessions: Number(metrics.sessions) || 0,
      leadsSubmitted: Number(metrics.leadsSubmitted) || 0,
      lastVisitAt: metrics.lastVisitAt || "",
      lastLeadAt: metrics.lastLeadAt || "",
      pageViews: metrics.pageViews || {},
      sources: metrics.sources || {},
      devices: metrics.devices || {}
    });
  } catch (error) {
    return json({ error: "Серверная аналитика пока не настроена." }, 503);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return json({ error: "Ожидается JSON-запрос." }, 415);
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return json({ error: "Не удалось прочитать тело запроса." }, 400);
  }

  const eventType = normalizeText(body.eventType, 20);
  const visitorId = normalizeText(body.visitorId, 80);
  const sessionId = normalizeText(body.sessionId, 80);
  const pageUrl = normalizeText(body.pageUrl, 500);
  const referrer = normalizeText(body.referrer, 500);
  const userAgent = normalizeText(body.userAgent, 500);

  if (!eventType || (eventType !== "visit" && eventType !== "lead")) {
    return json({ error: "Неизвестный тип события." }, 400);
  }

  try {
    const metrics = await loadMetrics(env);
    const now = new Date().toISOString();

    if (eventType === "visit") {
      metrics.totalVisits += 1;
      metrics.lastVisitAt = now;
      if (visitorId && !metrics.visitors.includes(visitorId)) {
        metrics.visitors.push(visitorId);
        metrics.uniqueVisitors = metrics.visitors.length;
      }
      if (sessionId && !metrics.sessionsList.includes(sessionId)) {
        metrics.sessionsList.push(sessionId);
        metrics.sessions = metrics.sessionsList.length;
      }
      incrementBucket(metrics, "pageViews", getPageLabel(pageUrl));
      incrementBucket(metrics, "sources", getSourceLabel(referrer, pageUrl));
      incrementBucket(metrics, "devices", getDeviceLabel(userAgent));
    }

    if (eventType === "lead") {
      metrics.leadsSubmitted += 1;
      metrics.lastLeadAt = now;
    }

    await saveMetrics(env, metrics);

    return json({
      ok: true,
      totalVisits: metrics.totalVisits,
      uniqueVisitors: metrics.uniqueVisitors,
      sessions: metrics.sessions,
      leadsSubmitted: metrics.leadsSubmitted,
      lastVisitAt: metrics.lastVisitAt,
      lastLeadAt: metrics.lastLeadAt,
      pageViews: metrics.pageViews || {},
      sources: metrics.sources || {},
      devices: metrics.devices || {}
    });
  } catch (error) {
    return json({ error: "Не удалось записать метрики." }, 503);
  }
}

export async function onRequestDelete(context) {
  try {
    const emptyMetrics = getDefaultMetrics();
    await saveMetrics(context.env, emptyMetrics);

    return json({
      ok: true,
      totalVisits: 0,
      uniqueVisitors: 0,
      sessions: 0,
      leadsSubmitted: 0,
      lastVisitAt: "",
      lastLeadAt: "",
      pageViews: {},
      sources: {},
      devices: {}
    });
  } catch (error) {
    return json({ error: "Не удалось сбросить серверную аналитику." }, 503);
  }
}
