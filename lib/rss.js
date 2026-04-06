import { RSS_FEEDS } from "./rss-feeds";

export async function getAllNews() {
  const results = await Promise.all(RSS_FEEDS.map((feed) => fetchFeed(feed)));
  return results.flat().sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`${feed.source} の RSS 取得に失敗しました。`);
  }

  const xml = await response.text();
  const entries = readEntries(xml);

  return entries
    .map((entry) => {
      const title = readTag(entry, "title");
      const link = readLink(entry);
      const publishedAt =
        normalizeDate(readTag(entry, "pubDate")) ||
        normalizeDate(readTag(entry, "published")) ||
        normalizeDate(readTag(entry, "updated"));

      return {
        title,
        link,
        source: feed.source,
        sourceId: feed.id,
        publishedAt
      };
    })
    .filter((article) => article.title && article.link);
}

function readEntries(xml) {
  const itemMatches = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)].map(
    (match) => match[1]
  );

  if (itemMatches.length > 0) {
    return itemMatches;
  }

  return [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g)].map(
    (match) => match[1]
  );
}

function readTag(text, tagName) {
  const match = text.match(
    new RegExp(
      `<${tagName}\\b[^>]*>(<!\\[CDATA\\[)?([\\s\\S]*?)(\\]\\]>)?<\\/${tagName}>`
    )
  );

  return match ? decodeXml(match[2].trim()) : "";
}

function readLink(text) {
  const rssLink = readTag(text, "link");

  if (rssLink) {
    return rssLink;
  }

  const atomLink = text.match(/<link\b[^>]*href="([^"]+)"[^>]*\/?>/i);
  return atomLink ? decodeXml(atomLink[1].trim()) : "";
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
