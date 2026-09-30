const JSON_HEADERS = {
  "Content-Type": "application/json; charset=UTF-8",
  "Cache-Control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function normalizeText(value, maxLength) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

async function verifyTurnstile(request, env, token) {
  const secret = String(env.TURNSTILE_SECRET_KEY || "").trim();
  if (!secret) {
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, error: "Не пройдена проверка Cloudflare Turnstile." };
  }

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const formData = new FormData();
  formData.set("secret", secret);
  formData.set("response", token);
  if (ip) {
    formData.set("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    return { ok: false, error: "Cloudflare Turnstile недоступен." };
  }

  const result = await response.json();
  if (!result.success) {
    return { ok: false, error: "Проверка Cloudflare Turnstile не пройдена." };
  }

  return { ok: true, skipped: false };
}

async function forwardLead(env, lead) {
  const webhookUrl = String(env.LEADS_WEBHOOK_URL || "").trim();
  if (!webhookUrl) {
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Site-Source": "mebel-atelier"
    },
    body: JSON.stringify(lead)
  });

  if (!response.ok) {
    throw new Error("Не удалось передать заявку во внешний обработчик.");
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

  const name = normalizeText(body.name, 120);
  const phone = normalizeText(body.phone, 40);
  const trapField = normalizeText(body.trapField, 120);
  const pageUrl = normalizeText(body.pageUrl, 500);
  const userAgent = normalizeText(body.userAgent, 500);
  const createdAt = normalizeText(body.createdAt, 80);
  const startedAt = Number(body.startedAt || 0);
  const submittedAt = Date.now();
  const minFillTime = Math.max(1000, Number(env.LEAD_MIN_FILL_MS || 3000));

  if (trapField) {
    return json({ error: "Проверка формы не пройдена." }, 400);
  }

  if (!name || !phone) {
    return json({ error: "Заполните имя и телефон." }, 400);
  }

  if (!startedAt || submittedAt - startedAt < minFillTime) {
    return json({ error: "Форма отправлена слишком быстро." }, 400);
  }

  const turnstileCheck = await verifyTurnstile(request, env, normalizeText(body.turnstileToken, 2048));
  if (!turnstileCheck.ok) {
    return json({ error: turnstileCheck.error }, 403);
  }

  const lead = {
    id: normalizeText(body.id, 80) || "lead-" + submittedAt,
    name,
    phone,
    createdAt: createdAt || new Date(submittedAt).toISOString(),
    pageUrl,
    userAgent
  };

  try {
    await forwardLead(env, lead);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Не удалось обработать заявку." }, 502);
  }

  return json({
    ok: true,
    protectedBy: turnstileCheck.skipped ? "honeypot" : "turnstile",
    lead
  });
}
