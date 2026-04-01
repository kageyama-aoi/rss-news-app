"use client";

import { useState } from "react";

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [savedNews, setSavedNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedError, setSavedError] = useState("");
  const [summaryLoadingMap, setSummaryLoadingMap] = useState({});
  const [summaryMap, setSummaryMap] = useState({});
  const [saveLoadingMap, setSaveLoadingMap] = useState({});
  const [saveMessageMap, setSaveMessageMap] = useState({});

  const loadNews = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rss", {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("ニュースの取得に失敗しました。");
      }

      const data = await response.json();
      setNews(data);
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
      const response = await fetch("/api/news", {
        cache: "no-store"
      });

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
        body: JSON.stringify({
          title: article.title
        })
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
          Yahoo News と NHK News の RSS をまとめて取得し、AI要約と保存まで行います。
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

        {error ? <p style={styles.error}>{error}</p> : null}
        {savedError ? <p style={styles.error}>{savedError}</p> : null}

        <h2 style={styles.sectionHeading}>取得したニュース</h2>
        <ul style={styles.list}>
          {news.map((article) => {
            const key = `${article.source}-${article.link}`;

            return (
              <li key={key} style={styles.listItem}>
                <p style={styles.source}>{article.source}</p>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
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

        <h2 style={styles.sectionHeading}>保存済みニュース</h2>
        <ul style={styles.list}>
          {savedNews.map((article) => (
            <li key={article.id} style={styles.listItem}>
              <p style={styles.source}>{article.source}</p>
              <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                style={styles.link}
              >
                {article.title}
              </a>
              {article.summary ? (
                <p style={styles.summaryText}>{article.summary}</p>
              ) : (
                <p style={styles.summaryEmpty}>要約はまだ保存されていません。</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
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
    maxWidth: "760px",
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
  sectionHeading: {
    marginTop: "28px",
    marginBottom: "12px",
    fontSize: "20px"
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
  source: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#2563eb"
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
  }
};
