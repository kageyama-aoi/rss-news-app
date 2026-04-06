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
