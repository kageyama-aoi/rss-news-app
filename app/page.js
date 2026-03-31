"use client";

import { useState } from "react";

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.heading}>RSSニュースアプリ</h1>
        <p style={styles.description}>
          Yahoo News と NHK News の RSS をまとめて取得して表示します。
        </p>

        <button onClick={loadNews} style={styles.button} disabled={loading}>
          {loading ? "取得中..." : "ニュース取得"}
        </button>

        {error ? <p style={styles.error}>{error}</p> : null}

        <ul style={styles.list}>
          {news.map((article) => (
            <li key={`${article.source}-${article.link}`} style={styles.listItem}>
              <p style={styles.source}>{article.source}</p>
              <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                style={styles.link}
              >
                {article.title}
              </a>
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
    maxWidth: "720px",
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
    color: "#475569"
  },
  button: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer"
  },
  error: {
    marginTop: "16px",
    color: "#dc2626"
  },
  list: {
    listStyle: "none",
    padding: 0,
    marginTop: "24px",
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
  }
};
