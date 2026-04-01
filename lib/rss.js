const RSS_FEEDS = [
  {
    source: "Yahoo News",
    url: "https://news.yahoo.co.jp/rss/topics/top-picks.xml"
  },
  {
    source: "NHK News",
    url: "https://www3.nhk.or.jp/rss/news/cat0.xml"
  }
];

export async function getAllNews() {
  const results = await Promise.all(RSS_FEEDS.map((feed) => fetchFeed(feed)));
  return results.flat();
}

async function fetchFeed(feed) {
  const response = await fetch(feed.url, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`${feed.source} の RSS 取得に失敗しました。`);
  }

  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  return items
    .map((item) => {
      const block = item[1];

      return {
        title: readTag(block, "title"),
        link: readTag(block, "link"),
        source: feed.source,
        publishedAt: normalizeDate(readTag(block, "pubDate"))
      };
    })
    .filter((article) => article.title && article.link);
}

function readTag(text, tagName) {
  const match = text.match(
    new RegExp(
      `<${tagName}>(<!\\[CDATA\\[)?([\\s\\S]*?)(\\]\\]>)?<\\/${tagName}>`
    )
  );

  return match ? decodeXml(match[2].trim()) : "";
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
