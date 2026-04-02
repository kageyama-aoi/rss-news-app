"use client";

import { useEffect, useMemo, useState } from "react";

const COPY = {
  appEyebrow: "Curated RSS Workspace",
  heading: "News Hub",
  description:
    "取得、要約、保存、検索をひとつの画面にまとめたRSSニュースワークスペースです。Apple Human Interface Guidelinesの階層性、余白、素材感、操作の明快さを意識して再設計しています。",
  fetchNews: "最新を取得",
  fetchNewsLoading: "取得中...",
  syncSaved: "保存済みを同期",
  syncSavedLoading: "同期中...",
  lastUpdated: "最終更新",
  latestFeed: "最新フィード",
  latestFeedHint: "ソース単位で整理した最新ニュース",
  savedLibrary: "保存ライブラリ",
  savedLibraryHint: "あとで見返す記事を保管",
  searchTitle: "保存済み検索",
  searchDescription:
    "保存済み記事のタイトルを検索します。主要導線として常に見つけやすい位置に配置しています。",
  searchPlaceholder: "タイトルで検索",
  searchAction: "検索",
  searchLoading: "検索中...",
  clearAction: "クリア",
  manualTitle: "手動保存",
  manualDescription:
    "URLとタイトルを直接入力して保存できます。入力項目は最小限に絞り、軽い操作感を優先しています。",
  manualTitlePlaceholder: "記事タイトル",
  manualUrlPlaceholder: "https://example.com/article",
  manualSourcePlaceholder: "ソース名",
  manualSaveAction: "手動保存",
  manualSaveLoading: "保存中...",
  defaultSource: "Manual Save",
  summarizeAction: "要約",
  summarizeLoading: "要約中...",
  saveAction: "保存",
  saveLoading: "保存中...",
  openAction: "開く",
  searchEmpty: "検索結果はまだありません。",
  fetchedEmpty: "ニュースを取得するとここに表示されます。",
  savedEmpty: "保存済みニュースはまだありません。",
  noSummary: "要約はまだありません。",
  unknownDate: "日時不明",
  sourceFallback: "その他",
  liveStatusIdle: "準備完了",
  liveStatusBusy: "更新中",
  sectionOverview: "概要",
  sectionSearch: "検索",
  sectionCapture: "保存",
  sectionFeed: "フィード",
  sectionLibrary: "ライブラリ"
};

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [savedNews, setSavedNews] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualSource, setManualSource] = useState(COPY.defaultSource);
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
  const sourceCount = Object.keys(groupedNews).length;
  const activeStatus =
    loading || savedLoading || searchLoading || manualSaveLoading
      ? COPY.liveStatusBusy
      : COPY.liveStatusIdle;

  useEffect(() => {
    loadNews();
    loadSavedNews();
  }, []);

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
      setError(err.message || "予期しないエラーが発生しました。");
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

  const clearSearch = () => {
    setSearchKeyword("");
    setSearchResults([]);
    setSearchError("");
  };

  const summarizeTitle = async (article) => {
    const key = getArticleKey(article);

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
    const key = getArticleKey(article);

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
        throw new Error("タイトルとURLを入力してください。");
      }

      const response = await fetch("/api/news/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: manualTitle.trim(),
          link: manualUrl.trim(),
          source: manualSource.trim() || COPY.defaultSource,
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
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="workspace">
        <nav className="section-nav glass-card" aria-label="ページ内ナビゲーション">
          <a href="#overview">{COPY.sectionOverview}</a>
          <a href="#search">{COPY.sectionSearch}</a>
          <a href="#capture">{COPY.sectionCapture}</a>
          <a href="#feed">{COPY.sectionFeed}</a>
          <a href="#library">{COPY.sectionLibrary}</a>
        </nav>

        <header className="hero-card glass-card" id="overview">
          <div className="hero-copy">
            <p className="eyebrow">{COPY.appEyebrow}</p>
            <div className="hero-title-row">
              <h1>{COPY.heading}</h1>
              <span className={`status-pill ${activeStatus === COPY.liveStatusBusy ? "busy" : ""}`}>
                <span className="status-dot" />
                {activeStatus}
              </span>
            </div>
            <p className="hero-description">{COPY.description}</p>

            <div className="hero-meta">
              <InfoPill label="Feed" value={`${news.length} items`} />
              <InfoPill label="Source" value={`${sourceCount} feeds`} />
              <InfoPill label="Saved" value={`${savedNews.length} items`} />
              <InfoPill
                label={COPY.lastUpdated}
                value={fetchedAt ? formatDateTime(fetchedAt) : COPY.unknownDate}
              />
            </div>
          </div>

          <div className="hero-toolbar">
            <button className="button button-primary" onClick={loadNews} disabled={loading}>
              <ToolbarIcon name="arrow.down.circle.fill" />
              <span>{loading ? COPY.fetchNewsLoading : COPY.fetchNews}</span>
            </button>
            <button
              className="button button-secondary"
              onClick={loadSavedNews}
              disabled={savedLoading}
            >
              <ToolbarIcon name="bookmark.circle" />
              <span>{savedLoading ? COPY.syncSavedLoading : COPY.syncSaved}</span>
            </button>
          </div>
        </header>

        {(error || savedError) && (
          <section className="message-strip error-strip glass-card" aria-live="polite">
            {error ? <p>{error}</p> : null}
            {savedError ? <p>{savedError}</p> : null}
          </section>
        )}

        <section className="control-grid">
          <article className="panel glass-card" id="search">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Search</p>
                <h2>{COPY.searchTitle}</h2>
              </div>
            </div>

            <p className="panel-description">{COPY.searchDescription}</p>

            <div className="search-bar" role="search">
              <label className="search-field">
                <SearchIcon />
                <input
                  type="search"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      searchSavedNews();
                    }
                  }}
                  placeholder={COPY.searchPlaceholder}
                />
              </label>
              <button
                className="button button-secondary"
                onClick={searchSavedNews}
                disabled={searchLoading}
              >
                <span>{searchLoading ? COPY.searchLoading : COPY.searchAction}</span>
              </button>
              <button
                className="button button-tertiary"
                onClick={clearSearch}
                disabled={!searchKeyword && searchResults.length === 0}
              >
                <span>{COPY.clearAction}</span>
              </button>
            </div>

            {searchError ? <p className="inline-error">{searchError}</p> : null}

            <ArticleList items={searchResults} emptyMessage={COPY.searchEmpty} />
          </article>

          <article className="panel glass-card" id="capture">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Capture</p>
                <h2>{COPY.manualTitle}</h2>
              </div>
            </div>

            <p className="panel-description">{COPY.manualDescription}</p>

            <div className="form-grid">
              <label className="field">
                <span>タイトル</span>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(event) => setManualTitle(event.target.value)}
                  placeholder={COPY.manualTitlePlaceholder}
                />
              </label>
              <label className="field">
                <span>URL</span>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(event) => setManualUrl(event.target.value)}
                  placeholder={COPY.manualUrlPlaceholder}
                />
              </label>
              <label className="field">
                <span>ソース</span>
                <input
                  type="text"
                  value={manualSource}
                  onChange={(event) => setManualSource(event.target.value)}
                  placeholder={COPY.manualSourcePlaceholder}
                />
              </label>
            </div>

            <div className="panel-actions">
              <button
                className="button button-primary"
                onClick={saveManualNews}
                disabled={manualSaveLoading}
              >
                <ToolbarIcon name="square.and.arrow.down" />
                <span>{manualSaveLoading ? COPY.manualSaveLoading : COPY.manualSaveAction}</span>
              </button>
            </div>

            {manualSaveMessage ? (
              <p className="inline-success" aria-live="polite">
                {manualSaveMessage}
              </p>
            ) : null}
          </article>
        </section>

        <section className="content-grid">
          <article className="content-panel glass-card" id="feed">
            <div className="content-panel-header">
              <div>
                <p className="section-kicker">Live Feed</p>
                <h2>{COPY.latestFeed}</h2>
              </div>
              <p>{COPY.latestFeedHint}</p>
            </div>

            {Object.keys(groupedNews).length === 0 ? (
              <EmptyState message={COPY.fetchedEmpty} />
            ) : (
              <div className="source-stack">
                {Object.entries(groupedNews).map(([source, articles]) => (
                  <details className="source-group" key={source} open>
                    <summary>
                      <div>
                        <h3>{source}</h3>
                        <p>{articles.length} items</p>
                      </div>
                      <ChevronIcon />
                    </summary>

                    <div className="source-body">
                      {articles.map((article) => {
                        const key = getArticleKey(article);

                        return (
                          <FetchedArticleRow
                            article={article}
                            key={key}
                            onSave={() => saveNews(article)}
                            onSummarize={() => summarizeTitle(article)}
                            saveLoading={Boolean(saveLoadingMap[key])}
                            summary={summaryMap[key]}
                            summaryLoading={Boolean(summaryLoadingMap[key])}
                            saveMessage={saveMessageMap[key]}
                          />
                        );
                      })}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </article>

          <article className="content-panel glass-card" id="library">
            <div className="content-panel-header">
              <div>
                <p className="section-kicker">Library</p>
                <h2>{COPY.savedLibrary}</h2>
              </div>
              <p>{COPY.savedLibraryHint}</p>
            </div>

            <ArticleList items={savedNews} emptyMessage={COPY.savedEmpty} />
          </article>
        </section>
      </section>
    </main>
  );
}

function FetchedArticleRow({
  article,
  onSave,
  onSummarize,
  saveLoading,
  summary,
  summaryLoading,
  saveMessage
}) {
  return (
    <article className="article-row">
      <div className="article-copy">
        <div className="article-meta">
          <span className="source-chip">{article.source || COPY.sourceFallback}</span>
          <span>{formatDateTime(article.publishedAt)}</span>
        </div>

        <a href={article.link} target="_blank" rel="noreferrer" className="article-link">
          {article.title}
        </a>

        <p className={`article-summary ${summary ? "filled" : ""}`}>
          {summary || COPY.noSummary}
        </p>

        {saveMessage ? <p className="inline-success">{saveMessage}</p> : null}
      </div>

      <div className="article-actions">
        <a
          className="button button-tertiary"
          href={article.link}
          target="_blank"
          rel="noreferrer"
        >
          <ToolbarIcon name="arrow.up.forward" />
          <span>{COPY.openAction}</span>
        </a>
        <button className="button button-tertiary" onClick={onSummarize} disabled={summaryLoading}>
          <ToolbarIcon name="sparkles" />
          <span>{summaryLoading ? COPY.summarizeLoading : COPY.summarizeAction}</span>
        </button>
        <button className="button button-secondary" onClick={onSave} disabled={saveLoading}>
          <ToolbarIcon name="bookmark" />
          <span>{saveLoading ? COPY.saveLoading : COPY.saveAction}</span>
        </button>
      </div>
    </article>
  );
}

function ArticleList({ items, emptyMessage }) {
  if (items.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="article-list">
      {items.map((article) => (
        <article className="library-item" key={article.id || getArticleKey(article)}>
          <div className="article-meta">
            <span className="source-chip">{article.source || COPY.sourceFallback}</span>
            <span>
              {article.created_at
                ? formatDateTime(article.created_at)
                : formatDateTime(article.publishedAt)}
            </span>
          </div>

          <a href={article.link} target="_blank" rel="noreferrer" className="article-link">
            {article.title}
          </a>

          <p className={`article-summary ${article.summary ? "filled" : ""}`}>
            {article.summary || COPY.noSummary}
          </p>
        </article>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <div className="empty-orb" />
      <p>{message}</p>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="info-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getArticleKey(article) {
  return `${article.source}-${article.link}`;
}

function groupBySource(items) {
  return items.reduce((groups, article) => {
    const source = article.source || COPY.sourceFallback;

    if (!groups[source]) {
      groups[source] = [];
    }

    groups[source].push(article);
    return groups;
  }, {});
}

function formatDateTime(value) {
  if (!value) {
    return COPY.unknownDate;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return COPY.unknownDate;
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="chevron-icon">
      <path d="M6 8l4 4 4-4" />
    </svg>
  );
}

function ToolbarIcon({ name }) {
  const icons = {
    bookmark: (
      <path d="M7 4.75A1.75 1.75 0 0 1 8.75 3h6.5A1.75 1.75 0 0 1 17 4.75V19l-5-3-5 3V4.75Z" />
    ),
    "bookmark.circle": (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8.25A1.25 1.25 0 0 1 11.25 7h1.5A1.25 1.25 0 0 1 14 8.25V15l-2-1.3L10 15V8.25Z" />
      </>
    ),
    "arrow.down.circle.fill": (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v8" />
        <path d="M8.75 12.75 12 16l3.25-3.25" />
      </>
    ),
    "square.and.arrow.down": (
      <>
        <path d="M7 12.75V17h10v-4.25" />
        <path d="M12 5v9" />
        <path d="M8.75 10.75 12 14l3.25-3.25" />
      </>
    ),
    "arrow.up.forward": (
      <>
        <path d="M14 6h4v4" />
        <path d="M10 14 18 6" />
        <path d="M18 13.5V18H6V6h4.5" />
      </>
    ),
    sparkles: (
      <>
        <path d="M12 4l1.1 3.25L16.5 8.5l-3.4 1.25L12 13l-1.1-3.25L7.5 8.5l3.4-1.25L12 4Z" />
        <path d="M18 14l.55 1.45L20 16l-1.45.55L18 18l-.55-1.45L16 16l1.45-.55L18 14Z" />
        <path d="M6 14l.8 2.2L9 17l-2.2.8L6 20l-.8-2.2L3 17l2.2-.8L6 14Z" />
      </>
    )
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="toolbar-icon">
      {icons[name]}
    </svg>
  );
}
