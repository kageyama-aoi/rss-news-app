"use client";

import { useMemo, useState } from "react";

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [savedNews, setSavedNews] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedError, setSavedError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [summaryLoadingMap, setSummaryLoadingMap] = useState({});
  const [summaryMap, setSummaryMap] = useState({});
  const [saveLoadingMap, setSaveLoadingMap] = useState({});
  const [saveMessageMap, setSaveMessageMap] = useState({});
  const [fetchedAt, setFetchedAt] = useState(null);

  const groupedNews = useMemo(() => groupBySource(news), [news]);

  const loadNews = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rss", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("ニュースの取得に失敗しました。");
      }

      const data = await response.json();
      setNews(data);
      setFetchedAt(new Date().toISOString());
    } catch (err) {
      setError(err.message || "不明なエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedNews = async () => {
    setSavedLoading(true);
    setSavedError("");

    try {
      const response = await fetch("/api/news", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "保存済みニュースの取得に失敗しました。");
      }

      setSavedNews(data);
    } catch (err) {
      setSavedError(err.message || "保存済みニュースを取得できませんでした。");
    } finally {
      setSavedLoading(false);
    }
  };

  const searchSavedNews = async () => {
    setSearchLoading(true);
    setSearchError("");

    try {
      if (!searchKeyword.trim()) {
        throw new Error("検索キーワードを入力してください。");
      }

      const response = await fetch(
        `/api/news/search?q=${encodeURIComponent(searchKeyword.trim())}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ニュース検索に失敗しました。");
      }

      setSearchResults(data);
    } catch (err) {
      setSearchError(err.message || "検索に失敗しました。");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const summarizeTitle = async (article) => {
    const key = `${article.source}-${article.link}`;

    setSummaryLoadingMap((current) => ({
      ...current,
      [key]: true
    }));

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: article.title })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI要約に失敗しました。");
      }

      setSummaryMap((current) => ({
        ...current,
        [key]: data.summary
      }));
    } catch (err) {
      setSummaryMap((current) => ({
        ...current,
        [key]: `エラー: ${err.message || "要約できませんでした。"}`
      }));
    } finally {
      setSummaryLoadingMap((current) => ({
        ...current,
        [key]: false
      }));
    }
  };

  const saveNews = async (article) => {
    const key = `${article.source}-${article.link}`;

    setSaveLoadingMap((current) => ({
      ...current,
      [key]: true
    }));

    setSaveMessageMap((current) => ({
      ...current,
      [key]: ""
    }));

    try {
      const response = await fetch("/api/news/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: article.title,
          link: article.link,
          source: article.source,
          summary: summaryMap[key] || ""
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ニュース保存に失敗しました。");
      }

      setSaveMessageMap((current) => ({
        ...current,
        [key]: data.message
      }));

      loadSavedNews();
    } catch (err) {
      setSaveMessageMap((current) => ({
        ...current,
        [key]: `エラー: ${err.message || "保存できませんでした。"}`
      }));
    } finally {
      setSaveLoadingMap((current) => ({
        ...current,
        [key]: false
      }));
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.heading}>RSSニュースアプリ</h1>
        <p style={styles.description}>
          RSSごとにニュースを見やすく整理し、公開日時、要約、保存、検索をまとめて扱えます。
        </p>

        <div style={styles.toolbar}>
          <button onClick={loadNews} style={styles.primaryButton} disabled={loading}>
            {loading ? "取得中..." : "ニュース取得"}
          </button>
          <button
            onClick={loadSavedNews}
            style={styles.secondaryButton}
            disabled={savedLoading}
          >
            {savedLoading ? "読込中..." : "保存済みニュース取得"}
          </button>
        </div>

        {fetchedAt ? (
          <p style={styles.infoText}>最終取得: {formatDateTime(fetchedAt)}</p>
        ) : null}

        {error ? <p style={styles.error}>{error}</p> : null}
        {savedError ? <p style={styles.error}>{savedError}</p> : null}

        <details open style={styles.panel}>
          <summary style={styles.panelSummary}>検索</summary>
          <div style={styles.panelBody}>
            <p style={styles.helpText}>
              保存済みニュースのタイトルを部分一致で検索します。本文や要約ではなく、
              タイトル文字列に検索語が含まれるニュースがヒットします。
            </p>
            <div style={styles.searchRow}>
              <input
                type="text"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="タイトル検索"
                style={styles.input}
              />
              <button
                onClick={searchSavedNews}
                style={styles.secondaryButton}
                disabled={searchLoading}
              >
                {searchLoading ? "検索中..." : "検索"}
              </button>
            </div>
            {searchError ? <p style={styles.error}>{searchError}</p> : null}
            {renderFlatArticleList(searchResults, "検索結果はまだありません。")}
          </div>
        </details>

        <details open style={styles.panel}>
          <summary style={styles.panelSummary}>
            取得したニュース ({news.length})
          </summary>
          <div style={styles.panelBody}>
            {renderGroupedFetchedNews(
              groupedNews,
              summaryLoadingMap,
              saveLoadingMap,
              summaryMap,
              saveMessageMap,
              summarizeTitle,
              saveNews
            )}
          </div>
        </details>

        <details style={styles.panel}>
          <summary style={styles.panelSummary}>
            保存済みニュース ({savedNews.length})
          </summary>
          <div style={styles.panelBody}>
            {renderFlatArticleList(
              savedNews,
              "保存済みニュースはまだありません。"
            )}
          </div>
        </details>
      </section>
    </main>
  );
}

function renderGroupedFetchedNews(
  groupedNews,
  summaryLoadingMap,
  saveLoadingMap,
  summaryMap,
  saveMessageMap,
  summarizeTitle,
  saveNews
) {
  const groups = Object.entries(groupedNews);

  if (groups.length === 0) {
    return <p style={styles.emptyText}>取得したニュースはまだありません。</p>;
  }

  return groups.map(([source, articles]) => (
    <section key={source} style={styles.groupSection}>
      <div style={styles.groupHeader}>
        <h3 style={styles.groupHeading}>{source}</h3>
        <span style={styles.groupCount}>{articles.length}件</span>
      </div>

      <ul style={styles.list}>
        {articles.map((article) => {
          const key = `${article.source}-${article.link}`;

          return (
            <li key={key} style={styles.listItem}>
              <div style={styles.metaRow}>
                <span style={styles.badge}>{article.source}</span>
                <span style={styles.metaText}>
                  公開: {formatDateTime(article.publishedAt)}
                </span>
              </div>

              <a href={article.link} target="_blank" rel="noreferrer" style={styles.link}>
                {article.title}
              </a>

              <div style={styles.actionRow}>
                <button
                  onClick={() => summarizeTitle(article)}
                  style={styles.secondaryButton}
                  disabled={summaryLoadingMap[key]}
                >
                  {summaryLoadingMap[key] ? "要約中..." : "AI要約"}
                </button>
                <button
                  onClick={() => saveNews(article)}
                  style={styles.secondaryButton}
                  disabled={saveLoadingMap[key]}
                >
                  {saveLoadingMap[key] ? "保存中..." : "保存"}
                </button>
              </div>

              {summaryMap[key] ? (
                <p style={styles.summaryText}>{summaryMap[key]}</p>
              ) : null}

              {saveMessageMap[key] ? (
                <p style={styles.saveMessage}>{saveMessageMap[key]}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  ));
}

function renderFlatArticleList(items, emptyMessage) {
  if (items.length === 0) {
    return <p style={styles.emptyText}>{emptyMessage}</p>;
  }

  return (
    <ul style={styles.list}>
      {items.map((article) => (
        <li key={article.id || `${article.source}-${article.link}`} style={styles.listItem}>
          <div style={styles.metaRow}>
            <span style={styles.badge}>{article.source}</span>
            <span style={styles.metaText}>
              {article.created_at
                ? `保存: ${formatDateTime(article.created_at)}`
                : `公開: ${formatDateTime(article.publishedAt)}`}
            </span>
          </div>

          <a href={article.link} target="_blank" rel="noreferrer" style={styles.link}>
            {article.title}
          </a>

          {article.summary ? (
            <p style={styles.summaryText}>{article.summary}</p>
          ) : (
            <p style={styles.summaryEmpty}>要約はまだありません。</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function groupBySource(items) {
  return items.reduce((groups, article) => {
    const source = article.source || "その他";

    if (!groups[source]) {
      groups[source] = [];
    }

    groups[source].push(article);
    return groups;
  }, {});
}

function formatDateTime(value) {
  if (!value) {
    return "日時不明";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "日時不明";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

const styles = {
  page: {
    minHeight: "100vh",
    margin: 0,
    padding: "40px 16px",
    backgroundColor: "#f5f7fb",
    fontFamily: "sans-serif"
  },
  card: {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "24px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)"
  },
  heading: {
    marginTop: 0,
    marginBottom: "12px"
  },
  description: {
    marginTop: 0,
    marginBottom: "16px",
    color: "#475569",
    lineHeight: 1.6
  },
  toolbar: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },
  infoText: {
    marginTop: "14px",
    marginBottom: 0,
    color: "#475569",
    fontSize: "14px"
  },
  panel: {
    marginTop: "20px",
    border: "1px solid #dbe4f0",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#fbfdff"
  },
  panelSummary: {
    cursor: "pointer",
    padding: "14px 16px",
    fontSize: "18px",
    fontWeight: 700,
    backgroundColor: "#eef4ff",
    listStyle: "none"
  },
  panelBody: {
    padding: "16px"
  },
  searchRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "12px"
  },
  helpText: {
    marginTop: 0,
    marginBottom: "12px",
    color: "#475569",
    lineHeight: 1.6,
    fontSize: "14px"
  },
  input: {
    minWidth: "260px",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px"
  },
  primaryButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer"
  },
  secondaryButton: {
    padding: "8px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#0f172a",
    cursor: "pointer"
  },
  error: {
    marginTop: "16px",
    color: "#dc2626"
  },
  groupSection: {
    marginBottom: "24px"
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
    paddingBottom: "6px",
    borderBottom: "2px solid #dbeafe"
  },
  groupHeading: {
    margin: 0,
    color: "#1d4ed8",
    fontSize: "18px"
  },
  groupCount: {
    color: "#475569",
    fontSize: "14px"
  },
  list: {
    listStyle: "none",
    padding: 0,
    marginTop: 0,
    display: "grid",
    gap: "12px"
  },
  listItem: {
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    backgroundColor: "#f8fafc"
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 12px",
    alignItems: "center",
    marginBottom: "10px"
  },
  badge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "999px",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "12px",
    fontWeight: 700
  },
  metaText: {
    color: "#64748b",
    fontSize: "13px"
  },
  link: {
    color: "#0f172a",
    textDecoration: "none",
    lineHeight: 1.6
  },
  actionRow: {
    marginTop: "12px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  summaryText: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#334155",
    lineHeight: 1.6
  },
  summaryEmpty: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#64748b"
  },
  saveMessage: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#047857"
  },
  emptyText: {
    marginTop: 0,
    color: "#64748b"
  }
};
