"use client";

import { useMemo, useState } from "react";

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [savedNews, setSavedNews] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualSource, setManualSource] = useState("Manual Save");
  const [loading, setLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [manualSaveLoading, setManualSaveLoading] = useState(false);
  const [manualSaveMessage, setManualSaveMessage] = useState("");
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

  const saveManualNews = async () => {
    setManualSaveLoading(true);
    setManualSaveMessage("");

    try {
      if (!manualTitle.trim() || !manualUrl.trim()) {
        throw new Error("タイトルと URL を入力してください。");
      }

      const response = await fetch("/api/news/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: manualTitle.trim(),
          link: manualUrl.trim(),
          source: manualSource.trim() || "Manual Save",
          summary: ""
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "手動保存に失敗しました。");
      }

      setManualSaveMessage(data.message);
      setManualTitle("");
      setManualUrl("");
      loadSavedNews();
    } catch (err) {
      setManualSaveMessage(`エラー: ${err.message || "保存できませんでした。"}`);
    } finally {
      setManualSaveLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <header style={styles.hero}>
          <div style={styles.heroText}>
            <div style={styles.eyebrow}>
              <Icon name="rss_feed" />
              <span>News Hub</span>
            </div>
            <h1 style={styles.heading}>RSSニュースアプリ</h1>
            <p style={styles.description}>
              Google 公開の Material Symbols を使って、一覧の視認性と操作性をまとめて改善しています。
              RSS 追加は `lib/rss-feeds.js` に定義を足すだけです。
            </p>
            {fetchedAt ? (
              <p style={styles.infoText}>
                <Icon name="schedule" />
                <span>最終取得: {formatDateTime(fetchedAt)}</span>
              </p>
            ) : null}
          </div>

          <div style={styles.heroActions}>
            <button onClick={loadNews} style={styles.primaryButton} disabled={loading}>
              <Icon name="download" />
              <span>{loading ? "取得中..." : "ニュース取得"}</span>
            </button>
            <button
              onClick={loadSavedNews}
              style={styles.secondaryButtonStrong}
              disabled={savedLoading}
            >
              <Icon name="bookmarks" />
              <span>{savedLoading ? "読込中..." : "保存済み取得"}</span>
            </button>
          </div>
        </header>

        {error ? <p style={styles.error}>{error}</p> : null}
        {savedError ? <p style={styles.error}>{savedError}</p> : null}

        <div style={styles.topGrid}>
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <Icon name="search" />
                <h2 style={styles.cardHeading}>検索</h2>
              </div>
            </div>
            <p style={styles.helpText}>
              保存済みニュースのタイトルを部分一致で検索します。
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
                <Icon name="manage_search" />
                <span>{searchLoading ? "検索中..." : "検索"}</span>
              </button>
            </div>
            {searchError ? <p style={styles.error}>{searchError}</p> : null}
            {renderCompactArticleList(searchResults, "検索結果はまだありません。")}
          </section>

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <Icon name="bookmark_add" />
                <h2 style={styles.cardHeading}>URLとタイトルを保存</h2>
              </div>
            </div>
            <div style={styles.formGrid}>
              <input
                type="text"
                value={manualTitle}
                onChange={(event) => setManualTitle(event.target.value)}
                placeholder="ニュースタイトル"
                style={styles.input}
              />
              <input
                type="url"
                value={manualUrl}
                onChange={(event) => setManualUrl(event.target.value)}
                placeholder="https://example.com/article"
                style={styles.input}
              />
              <input
                type="text"
                value={manualSource}
                onChange={(event) => setManualSource(event.target.value)}
                placeholder="保存元名"
                style={styles.input}
              />
            </div>
            <div style={styles.formActions}>
              <button
                onClick={saveManualNews}
                style={styles.primaryButton}
                disabled={manualSaveLoading}
              >
                <Icon name="save" />
                <span>{manualSaveLoading ? "保存中..." : "手動保存"}</span>
              </button>
            </div>
            {manualSaveMessage ? <p style={styles.saveMessage}>{manualSaveMessage}</p> : null}
          </section>
        </div>

        <details open style={styles.panel}>
          <summary style={styles.panelSummary}>
            <div style={styles.summaryInner}>
              <div style={styles.cardTitle}>
                <Icon name="newspaper" />
                <span>取得したニュース ({news.length})</span>
              </div>
            </div>
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
            <div style={styles.summaryInner}>
              <div style={styles.cardTitle}>
                <Icon name="inventory_2" />
                <span>保存済みニュース ({savedNews.length})</span>
              </div>
            </div>
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
          <div style={styles.cardTitle}>
            <Icon name="folder_open" />
            <h3 style={styles.groupHeading}>{source}</h3>
          </div>
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
                    <Icon name="auto_awesome" />
                    <span>{summaryLoadingMap[key] ? "要約中..." : "AI要約"}</span>
                  </button>
                  <button
                    onClick={() => saveNews(article)}
                    style={styles.secondaryButton}
                    disabled={saveLoadingMap[key]}
                  >
                    <Icon name="bookmark" />
                    <span>{saveLoadingMap[key] ? "保存中..." : "保存"}</span>
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

function Icon({ name }) {
  return <span className="material-symbols-outlined" style={styles.icon}>{name}</span>;
}

const styles = {
  page: {
    minHeight: "100vh",
    margin: 0,
    padding: "24px 14px 40px",
    background:
      "radial-gradient(circle at top left, #dbeafe 0%, #eef3f8 35%, #f8fafc 100%)"
  },
  shell: {
    maxWidth: "1180px",
    margin: "0 auto"
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: "18px",
    alignItems: "start",
    padding: "22px",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(239,246,255,0.96))",
    borderRadius: "18px",
    boxShadow: "0 16px 36px rgba(15, 23, 42, 0.10)"
  },
  heroText: {
    minWidth: 0
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    padding: "6px 10px",
    borderRadius: "999px",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "13px",
    fontWeight: 700
  },
  heading: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.15
  },
  description: {
    marginTop: "12px",
    marginBottom: 0,
    color: "#475569",
    lineHeight: 1.7,
    maxWidth: "760px"
  },
  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "flex-end"
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "16px",
    marginTop: "16px"
  },
  card: {
    padding: "18px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px"
  },
  cardTitle: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px"
  },
  cardHeading: {
    margin: 0,
    fontSize: "18px"
  },
  infoText: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    margin: "12px 4px 0",
    color: "#475569",
    fontSize: "14px"
  },
  panel: {
    marginTop: "16px",
    border: "1px solid #dbe4f0",
    borderRadius: "16px",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.04)"
  },
  panelSummary: {
    cursor: "pointer",
    padding: "14px 16px",
    listStyle: "none",
    backgroundColor: "#f4f8ff"
  },
  summaryInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
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
  formGrid: {
    display: "grid",
    gap: "10px"
  },
  formActions: {
    marginTop: "12px",
    display: "flex",
    justifyContent: "flex-start"
  },
  helpText: {
    marginTop: 0,
    marginBottom: "10px",
    color: "#475569",
    lineHeight: 1.55,
    fontSize: "14px"
  },
  input: {
    minWidth: "220px",
    padding: "12px 14px",
    border: "1px solid #d1d9e6",
    borderRadius: "10px",
    fontSize: "14px"
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 16px",
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 700
  },
  secondaryButtonStrong: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 16px",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    cursor: "pointer",
    fontWeight: 700
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
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
    borderRadius: "12px",
    backgroundColor: "#ffffff"
  },
  groupSummary: {
    cursor: "pointer",
    listStyle: "none",
    padding: "10px 12px",
    backgroundColor: "#f8fbff"
  },
  groupBody: {
    padding: "0 12px 12px"
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px"
  },
  groupHeading: {
    margin: 0,
    color: "#1d4ed8",
    fontSize: "16px"
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
    borderRadius: "12px",
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
    padding: "4px 9px",
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
    display: "block",
    fontWeight: 700
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
  },
  icon: {
    fontSize: "20px",
    lineHeight: 1
  }
};
