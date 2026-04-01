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
      <section style={styles.shell}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.heading}>RSSニュースアプリ</h1>
            <p style={styles.description}>
              一覧から気になるニュースをすぐ開ける密度に寄せています。RSS 追加は
              [lib/rss-feeds.js] に定義を足すだけです。
            </p>
          </div>
          <div style={styles.headerActions}>
            <button onClick={loadNews} style={styles.primaryButton} disabled={loading}>
              {loading ? "取得中..." : "ニュース取得"}
            </button>
            <button
              onClick={loadSavedNews}
              style={styles.secondaryButton}
              disabled={savedLoading}
            >
              {savedLoading ? "読込中..." : "保存済み取得"}
            </button>
          </div>
        </header>

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
            {renderCompactArticleList(searchResults, "検索結果はまだありません。")}
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
            {renderCompactArticleList(savedNews, "保存済みニュースはまだありません。")}
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
    <details key={source} style={styles.groupSection} open>
      <summary style={styles.groupSummary}>
        <div style={styles.groupHeader}>
          <h3 style={styles.groupHeading}>{source}</h3>
          <span style={styles.groupCount}>{articles.length}件</span>
        </div>
      </summary>

      <div style={styles.groupBody}>
        <ul style={styles.compactList}>
          {articles.map((article) => {
            const key = `${article.source}-${article.link}`;

            return (
              <li key={key} style={styles.compactItem}>
                <div style={styles.itemMain}>
                  <div style={styles.metaRow}>
                    <span style={styles.badge}>{article.source}</span>
                    <span style={styles.metaText}>
                      公開: {formatDateTime(article.publishedAt)}
                    </span>
                  </div>
                  <a href={article.link} target="_blank" rel="noreferrer" style={styles.link}>
                    {article.title}
                  </a>
                  {summaryMap[key] ? (
                    <p style={styles.summaryText}>{summaryMap[key]}</p>
                  ) : null}
                  {saveMessageMap[key] ? (
                    <p style={styles.saveMessage}>{saveMessageMap[key]}</p>
                  ) : null}
                </div>

                <div style={styles.itemActions}>
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
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  ));
}

function renderCompactArticleList(items, emptyMessage) {
  if (items.length === 0) {
    return <p style={styles.emptyText}>{emptyMessage}</p>;
  }

  return (
    <ul style={styles.compactList}>
      {items.map((article) => (
        <li key={article.id || `${article.source}-${article.link}`} style={styles.compactItem}>
          <div style={styles.itemMain}>
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
          </div>
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
    padding: "24px 14px",
    backgroundColor: "#eef3f8",
    fontFamily: "sans-serif"
  },
  shell: {
    maxWidth: "1120px",
    margin: "0 auto"
  },
  header: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "16px",
    alignItems: "start",
    padding: "18px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)"
  },
  heading: {
    marginTop: 0,
    marginBottom: "10px"
  },
  description: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end"
  },
  infoText: {
    margin: "12px 4px 0",
    color: "#475569",
    fontSize: "14px"
  },
  panel: {
    marginTop: "16px",
    border: "1px solid #dbe4f0",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)"
  },
  panelSummary: {
    cursor: "pointer",
    padding: "12px 16px",
    fontSize: "17px",
    fontWeight: 700,
    backgroundColor: "#eef4ff",
    listStyle: "none"
  },
  panelBody: {
    padding: "14px 16px"
  },
  searchRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "10px"
  },
  helpText: {
    marginTop: 0,
    marginBottom: "10px",
    color: "#475569",
    lineHeight: 1.55,
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
    cursor: "pointer",
    whiteSpace: "nowrap"
  },
  error: {
    marginTop: "14px",
    color: "#dc2626"
  },
  groupSection: {
    marginBottom: "12px",
    border: "1px solid #dbe4f0",
    borderRadius: "10px",
    backgroundColor: "#ffffff"
  },
  groupSummary: {
    cursor: "pointer",
    listStyle: "none",
    padding: "10px 12px"
  },
  groupBody: {
    padding: "0 12px 12px"
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: 0
  },
  groupHeading: {
    margin: 0,
    color: "#1d4ed8",
    fontSize: "17px"
  },
  groupCount: {
    color: "#475569",
    fontSize: "13px"
  },
  compactList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: "10px"
  },
  compactItem: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "12px",
    alignItems: "start",
    padding: "12px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    backgroundColor: "#f8fafc"
  },
  itemMain: {
    minWidth: 0
  },
  itemActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end"
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 12px",
    alignItems: "center",
    marginBottom: "8px"
  },
  badge: {
    display: "inline-block",
    padding: "3px 8px",
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
    lineHeight: 1.5,
    display: "block"
  },
  summaryText: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#334155",
    lineHeight: 1.55,
    fontSize: "14px"
  },
  summaryEmpty: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "14px"
  },
  saveMessage: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#047857",
    fontSize: "14px"
  },
  emptyText: {
    margin: 0,
    color: "#64748b"
  }
};
