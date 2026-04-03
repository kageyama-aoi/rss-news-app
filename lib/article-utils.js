import { COPY } from "./workspace-copy";

export function isArticleVisible(article, sourcePrefs, hideMuted, hideShorts) {
  const source = article.source || COPY.sourceFallback;
  const prefs = sourcePrefs[source] || { enabled: true, muted: false };

  if (!prefs.enabled) {
    return false;
  }

  if (hideMuted && prefs.muted) {
    return false;
  }

  if (hideShorts && article.link?.includes("/shorts/")) {
    return false;
  }

  return true;
}

export function getArticleKey(article) {
  return article.id ? `${article.id}-${article.link}` : `${article.source}-${article.link}`;
}

export function dedupeArticles(items) {
  const seen = new Set();

  return items.filter((article) => {
    const key = getArticleKey(article);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function groupBySource(items) {
  return items.reduce((groups, article) => {
    const source = article.source || COPY.sourceFallback;

    if (!groups[source]) {
      groups[source] = [];
    }

    groups[source].push(article);
    return groups;
  }, {});
}

export function buildTopicGroups(items) {
  const enriched = items.map((article) => ({ ...article, signature: buildSignature(article.title) }));
  const used = new Set();
  const groups = [];

  enriched.forEach((article, index) => {
    if (used.has(index)) {
      return;
    }

    const group = [article];

    for (let pointer = index + 1; pointer < enriched.length; pointer += 1) {
      if (used.has(pointer)) {
        continue;
      }

      if (signatureScore(article.signature, enriched[pointer].signature) >= 0.46) {
        used.add(pointer);
        group.push(enriched[pointer]);
      }
    }

    if (group.length > 1) {
      groups.push({ id: getArticleKey(article), label: article.title, items: group });
    }
  });

  return groups.slice(0, 8);
}

function buildSignature(title = "") {
  const normalized = title
    .toLowerCase()
    .replace(/[【】\[\]()（）"'!?！？、。・]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const compact = normalized.replace(/\s/g, "");
  const tokens = new Set(normalized.match(/[a-z0-9]{2,}/g) || []);

  for (let index = 0; index < compact.length - 1; index += 1) {
    tokens.add(compact.slice(index, index + 2));
  }

  return tokens;
}

function signatureScore(left, right) {
  if (left.size === 0 || right.size === 0) {
    return 0;
  }

  let shared = 0;
  left.forEach((token) => {
    if (right.has(token)) {
      shared += 1;
    }
  });

  return shared / Math.min(left.size, right.size);
}

export function formatDateTime(value) {
  if (!value) {
    return COPY.unknownDate;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? COPY.unknownDate
    : new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
}
