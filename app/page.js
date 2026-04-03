"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEYS = {
  readMap: "news-hub.read-map",
  laterMap: "news-hub.later-map",
  notesMap: "news-hub.notes-map",
  sourcePrefs: "news-hub.source-prefs",
  savedViews: "news-hub.saved-views"
};

const COPY = {
  title: "News Hub",
  subtitle:
    "少数の信頼ソースを毎日すばやく読むためのニュースワークスペースです。読む、残す、絞る、後で処理する、を1画面で回せるように再設計しています。",
  update: "最新を更新",
  updateLoading: "更新中...",
  syncSaved: "保存済みを同期",
  syncSavedLoading: "同期中...",
  searchTitle: "検索とビュー",
  searchHint:
    "最新フィード、保存済み、後で読む、未読を横断して検索できます。表示中のソース名やタイトルでそのまま絞り込めます。",
  searchPlaceholder: "タイトル・ソース・要約で検索",
  saveView: "ビュー保存",
  clear: "クリア",
  filtersTitle: "表示コントロール",
  filtersHint:
    "ノイズの少ない読み方に寄せるための設定です。Shorts非表示、未読優先、ソース単位の表示制御をまとめています。",
  hideShorts: "YouTube Shortsを隠す",
  unreadOnly: "未読だけ見る",
  hideMuted: "ミュートしたソースを隠す",
  groupTopics: "関連トピックをまとめる",
  sourceSettings: "ソース設定",
  captureTitle: "手動保存",
  captureHint:
    "URLとタイトルを直接入力して保存できます。保存先が未設定でも、まずは画面上で読む体験を優先しています。",
  feedTitle: "今日のフィード",
  feedHint: "いま読む記事を、横幅優先で見やすく表示",
  queueTitle: "後で読む",
  queueHint: "気になった記事を一時キューに退避",
  libraryTitle: "保存ライブラリ",
  libraryHint: "保存済み記事の保管庫",
  detailTitle: "記事ワークスペース",
  detailHint: "選択した記事のメモ、状態、関連情報を確認できます。",
  topicsTitle: "関連トピック",
  topicsHint: "似た見出しをまとめて一覧のノイズを減らします。",
  noTopics: "いまは似たトピックの束はありません。",
  emptyFeed: "ニュースを取得するとここに表示されます。",
  emptyQueue: "後で読む記事はまだありません。",
  emptyLibrary: "保存済みニュースはまだありません。",
  emptySearch: "一致する記事はありません。",
  idleSearch: "検索語を入力するか、保存したビューを選ぶとここに結果を表示します。",
  selectPrompt: "記事を1件選ぶと、メモと状態管理をここで続けられます。",
  savedUnavailable:
    "保存機能は現在利用できません。Supabase 環境変数が未設定のため、保存済み一覧と保存済み検索は動作しません。",
  notePlaceholder: "あとで見返すポイントや判断メモを書けます。",
  noSummary: "要約はまだありません。",
  unknownDate: "日時不明",
  sourceFallback: "その他",
  ready: "準備完了",
  busy: "更新中",
  savedReady: "保存機能は利用可能です。",
  savedMissing: "保存機能は未設定です。",
  open: "開く",
  detail: "詳細",
  summarize: "要約",
  summarizeLoading: "要約中...",
  save: "保存",
  saveLoading: "保存中...",
  markRead: "既読にする",
  markUnread: "未読に戻す",
  addLater: "後で読む",
  removeLater: "キュー解除",
  manualSave: "手動保存",
  manualSaving: "保存中..."
};

export default function HomePage() {
  const [news, setNews] = useState([]);
  const [savedNews, setSavedNews] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchScope, setSearchScope] = useState("all");
  const [viewName, setViewName] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualSource, setManualSource] = useState("Manual Save");
  const [loading, setLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [manualSaveLoading, setManualSaveLoading] = useState(false);
  const [manualSaveMessage, setManualSaveMessage] = useState("");
  const [error, setError] = useState("");
  const [savedError, setSavedError] = useState("");
  const [summaryLoadingMap, setSummaryLoadingMap] = useState({});
  const [summaryMap, setSummaryMap] = useState({});
  const [saveLoadingMap, setSaveLoadingMap] = useState({});
  const [saveMessageMap, setSaveMessageMap] = useState({});
  const [fetchedAt, setFetchedAt] = useState(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [readMap, setReadMap] = useState({});
  const [laterMap, setLaterMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [sourcePrefs, setSourcePrefs] = useState({});
  const [savedViews, setSavedViews] = useState([]);
  const [hideShorts, setHideShorts] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [hideMuted, setHideMuted] = useState(true);
  const [groupTopics, setGroupTopics] = useState(true);
  const [isDesktopNavOpen, setIsDesktopNavOpen] = useState(false);

  useEffect(() => {
    setReadMap(readStorage(STORAGE_KEYS.readMap, {}));
    setLaterMap(readStorage(STORAGE_KEYS.laterMap, {}));
    setNotesMap(readStorage(STORAGE_KEYS.notesMap, {}));
    setSourcePrefs(readStorage(STORAGE_KEYS.sourcePrefs, {}));
    setSavedViews(readStorage(STORAGE_KEYS.savedViews, []));
  }, []);

  useEffect(() => writeStorage(STORAGE_KEYS.readMap, readMap), [readMap]);
  useEffect(() => writeStorage(STORAGE_KEYS.laterMap, laterMap), [laterMap]);
  useEffect(() => writeStorage(STORAGE_KEYS.notesMap, notesMap), [notesMap]);
  useEffect(() => writeStorage(STORAGE_KEYS.sourcePrefs, sourcePrefs), [sourcePrefs]);
  useEffect(() => writeStorage(STORAGE_KEYS.savedViews, savedViews), [savedViews]);

  useEffect(() => {
    loadNews();
    loadSavedNews();
  }, []);

  const isSavedAvailable = !savedError.includes("未設定");
  const allSources = useMemo(
    () =>
      [...new Set([...news, ...savedNews].map((article) => article.source || COPY.sourceFallback))]
        .sort((left, right) => left.localeCompare(right, "ja")),
    [news, savedNews]
  );

  useEffect(() => {
    if (allSources.length === 0) {
      return;
    }

    setSourcePrefs((current) => {
      const next = { ...current };
      let changed = false;

      allSources.forEach((source) => {
        if (!next[source]) {
          next[source] = { enabled: true, muted: false };
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [allSources]);

  const activeStatus =
    loading || savedLoading || manualSaveLoading ? COPY.busy : COPY.ready;

  const visibleFeed = useMemo(
    () =>
      news
        .filter((article) => isArticleVisible(article, sourcePrefs, hideMuted, hideShorts))
        .filter((article) => !unreadOnly || !readMap[getArticleKey(article)]),
    [news, sourcePrefs, hideMuted, hideShorts, unreadOnly, readMap]
  );

  const visibleSaved = useMemo(
    () =>
      savedNews
        .filter((article) => isArticleVisible(article, sourcePrefs, hideMuted, hideShorts))
        .filter((article) => !unreadOnly || !readMap[getArticleKey(article)]),
    [savedNews, sourcePrefs, hideMuted, hideShorts, unreadOnly, readMap]
  );

  const queueItems = useMemo(() => {
    const map = new Map();

    [...visibleFeed, ...visibleSaved].forEach((article) => {
      const key = getArticleKey(article);

      if (laterMap[key] && !map.has(key)) {
        map.set(key, article);
      }
    });

    return [...map.values()];
  }, [visibleFeed, visibleSaved, laterMap]);

  const groupedFeed = useMemo(() => groupBySource(visibleFeed), [visibleFeed]);

  const searchResults = useMemo(() => {
    const pool =
      searchScope === "feed"
        ? visibleFeed
        : searchScope === "saved"
          ? visibleSaved
          : searchScope === "queue"
            ? queueItems
            : searchScope === "unread"
              ? [...visibleFeed, ...visibleSaved].filter(
                  (article) => !readMap[getArticleKey(article)]
                )
              : dedupeArticles([...visibleFeed, ...visibleSaved]);

    const query = searchKeyword.trim().toLowerCase();

    if (!query) {
      return searchScope === "all" ? [] : pool.map(withSearchBucket(searchScope));
    }

    return pool
      .filter((article) => {
        const haystack = [
          article.title,
          article.source,
          article.summary,
          notesMap[getArticleKey(article)] || ""
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .map(withSearchBucket(searchScope));
  }, [visibleFeed, visibleSaved, queueItems, searchScope, searchKeyword, readMap, notesMap]);

  const relatedGroups = useMemo(
    () => (groupTopics ? buildTopicGroups(visibleFeed) : []),
    [groupTopics, visibleFeed]
  );

  const selectedArticle = useMemo(() => {
    if (!selectedKey) {
      return null;
    }

    return [...news, ...savedNews].find((article) => getArticleKey(article) === selectedKey) || null;
  }, [selectedKey, news, savedNews]);

  const unreadCount = visibleFeed.filter((article) => !readMap[getArticleKey(article)]).length;
  const selectedNote = selectedArticle ? notesMap[getArticleKey(selectedArticle)] || "" : "";

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
      const message = err.message || "保存済みニュースを取得できませんでした。";
      setSavedError(message);
      setSavedNews([]);
    } finally {
      setSavedLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchKeyword("");
    setSearchScope("all");
  };

  const saveCurrentView = () => {
    const trimmed = viewName.trim();

    if (!trimmed) {
      return;
    }

    setSavedViews((current) => [
      {
        id: `${Date.now()}`,
        name: trimmed,
        query: searchKeyword,
        scope: searchScope,
        hideShorts,
        unreadOnly,
        hideMuted
      },
      ...current
    ]);
    setViewName("");
  };

  const applySavedView = (view) => {
    setSearchKeyword(view.query || "");
    setSearchScope(view.scope || "all");
    setHideShorts(view.hideShorts ?? true);
    setUnreadOnly(view.unreadOnly ?? false);
    setHideMuted(view.hideMuted ?? true);
  };

  const removeSavedView = (viewId) => {
    setSavedViews((current) => current.filter((view) => view.id !== viewId));
  };

  const toggleRead = (article) => {
    const key = getArticleKey(article);
    setReadMap((current) => ({ ...current, [key]: !current[key] }));
  };

  const toggleLater = (article) => {
    const key = getArticleKey(article);
    setLaterMap((current) => ({ ...current, [key]: !current[key] }));
  };

  const updateNote = (article, value) => {
    const key = getArticleKey(article);
    setNotesMap((current) => ({ ...current, [key]: value }));
  };

  const toggleSourceEnabled = (source) => {
    setSourcePrefs((current) => ({
      ...current,
      [source]: {
        enabled: !(current[source]?.enabled ?? true),
        muted: current[source]?.muted ?? false
      }
    }));
  };

  const toggleSourceMuted = (source) => {
    setSourcePrefs((current) => ({
      ...current,
      [source]: {
        enabled: current[source]?.enabled ?? true,
        muted: !(current[source]?.muted ?? false)
      }
    }));
  };

  const summarizeTitle = async (article) => {
    const key = getArticleKey(article);

    setSummaryLoadingMap((current) => ({ ...current, [key]: true }));

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: article.title })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI要約に失敗しました。");
      }

      setSummaryMap((current) => ({ ...current, [key]: data.summary }));
    } catch (err) {
      setSummaryMap((current) => ({
        ...current,
        [key]: `エラー: ${err.message || "要約できませんでした。"}`
      }));
    } finally {
      setSummaryLoadingMap((current) => ({ ...current, [key]: false }));
    }
  };

  const saveNews = async (article) => {
    const key = getArticleKey(article);

    setSaveLoadingMap((current) => ({ ...current, [key]: true }));
    setSaveMessageMap((current) => ({ ...current, [key]: "" }));

    try {
      const response = await fetch("/api/news/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      setSaveMessageMap((current) => ({ ...current, [key]: data.message }));
      loadSavedNews();
    } catch (err) {
      setSaveMessageMap((current) => ({
        ...current,
        [key]: `エラー: ${err.message || "保存できませんでした。"}`
      }));
    } finally {
      setSaveLoadingMap((current) => ({ ...current, [key]: false }));
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
        headers: { "Content-Type": "application/json" },
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
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="workspace">
        {isDesktopNavOpen ? (
          <button
            type="button"
            className="desktop-nav-scrim"
            aria-label="ナビゲーションを閉じる"
            onClick={() => setIsDesktopNavOpen(false)}
          />
        ) : null}
        <nav
          id="desktop-section-nav"
          className={`section-nav glass-card ${isDesktopNavOpen ? "is-open" : ""}`}
          aria-label="ページ内ナビゲーション"
        >
          <div className="sidebar-head">
            <div>
              <p>Workspace</p>
              <span>読む、残す、絞る</span>
            </div>
            <button
              type="button"
              className="button button-tertiary nav-close"
              onClick={() => setIsDesktopNavOpen(false)}
              title="ナビゲーションを閉じる"
            >
              閉じる
            </button>
          </div>
          <a href="#overview" onClick={() => setIsDesktopNavOpen(false)}>概要</a>
          <a href="#search" onClick={() => setIsDesktopNavOpen(false)}>検索</a>
          <a href="#filters" onClick={() => setIsDesktopNavOpen(false)}>整理</a>
          <a href="#feed" onClick={() => setIsDesktopNavOpen(false)}>フィード</a>
          <a href="#queue" onClick={() => setIsDesktopNavOpen(false)}>後で読む</a>
          <a href="#library" onClick={() => setIsDesktopNavOpen(false)}>保存済み</a>
        </nav>
        <header className="hero-card glass-card" id="overview">
          <div className="hero-copy">
            <p className="eyebrow">Curated RSS Workspace</p>
            <div className="hero-title-row">
              <h1>{COPY.title}</h1>
              <span className={`status-pill ${activeStatus === COPY.busy ? "busy" : ""}`}>
                <span className="status-dot" />
                {activeStatus}
              </span>
            </div>
            <p className="hero-description">{COPY.subtitle}</p>
            <div className="hero-meta">
              <MetricPill label="表示中" value={`${visibleFeed.length}`} />
              <MetricPill label="未読" value={`${unreadCount}`} />
              <MetricPill label="後で読む" value={`${queueItems.length}`} />
              <MetricPill label="ソース" value={`${allSources.length}`} />
              <MetricPill
                label="最終更新"
                value={fetchedAt ? formatDateTime(fetchedAt) : COPY.unknownDate}
              />
            </div>
          </div>
          <div className="hero-toolbar">
            <button
              type="button"
              className="button button-tertiary desktop-nav-toggle"
              onClick={() => setIsDesktopNavOpen((current) => !current)}
              aria-expanded={isDesktopNavOpen}
              aria-controls="desktop-section-nav"
              title="ページ内ナビゲーションを開く"
            >
              <ToolbarIcon name="sidebar.left" />
              <span>{isDesktopNavOpen ? "ナビを閉じる" : "ナビを開く"}</span>
            </button>
            <button className="button button-primary" onClick={loadNews} disabled={loading}>
              <ToolbarIcon name="arrow.down.circle.fill" />
              <span>{loading ? COPY.updateLoading : COPY.update}</span>
            </button>
            <button className="button button-secondary" onClick={loadSavedNews} disabled={savedLoading}>
              <ToolbarIcon name="bookmark.circle" />
              <span>{savedLoading ? COPY.syncSavedLoading : COPY.syncSaved}</span>
            </button>
            <p className="hero-status-note">
              {isSavedAvailable ? COPY.savedReady : COPY.savedMissing}
            </p>
          </div>
        </header>
        {(error || savedError) && (
          <section className="message-strip error-strip glass-card" aria-live="polite">
            {error ? <p>{error}</p> : null}
            {savedError ? <p>{savedError}</p> : null}
          </section>
        )}
        <section className="control-layout">
          <article className="panel glass-card" id="search">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Search</p>
                <h2>{COPY.searchTitle}</h2>
              </div>
            </div>
            <p className="panel-description">{COPY.searchHint}</p>
            <div className="scope-row" role="tablist" aria-label="検索対象">
              {[
                ["all", "すべて"],
                ["feed", "フィード"],
                ["saved", "保存済み"],
                ["queue", "後で読む"],
                ["unread", "未読"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`scope-chip ${searchScope === value ? "active" : ""}`}
                  onClick={() => setSearchScope(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="search-bar" role="search">
              <label className="search-field">
                <SearchIcon />
                <input
                  type="search"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder={COPY.searchPlaceholder}
                />
              </label>
              <button
                className="button button-tertiary"
                onClick={clearSearch}
                disabled={!searchKeyword && searchScope === "all"}
              >
                {COPY.clear}
              </button>
            </div>
            <div className="saved-view-row">
              <label className="inline-field">
                <input
                  type="text"
                  value={viewName}
                  onChange={(event) => setViewName(event.target.value)}
                  placeholder="例: AIニュースだけ"
                />
              </label>
              <button
                className="button button-secondary"
                onClick={saveCurrentView}
                disabled={!viewName.trim()}
              >
                {COPY.saveView}
              </button>
            </div>
            {savedViews.length > 0 ? (
              <div className="saved-view-list">
                {savedViews.map((view) => (
                  <div className="saved-view-chip" key={view.id}>
                    <button type="button" onClick={() => applySavedView(view)} title={`保存ビュー: ${view.name}`}>
                      {view.name}
                    </button>
                    <button type="button" onClick={() => removeSavedView(view.id)} title={`${view.name} を削除`}>
                      削除
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <p className="search-summary">検索結果: {searchResults.length}</p>
            {searchKeyword.trim() || searchScope !== "all" ? (
              <ArticleList
                items={searchResults}
                emptyMessage={COPY.emptySearch}
                laterMap={laterMap}
                notesMap={notesMap}
                onSelect={setSelectedKey}
                readMap={readMap}
              />
            ) : (
              <EmptyState message={COPY.idleSearch} />
            )}
          </article>
          <div className="side-stack">
            <article className="panel glass-card" id="filters">
              <div className="panel-header">
                <div>
                  <p className="section-kicker">Refine</p>
                  <h2>{COPY.filtersTitle}</h2>
                </div>
              </div>
              <p className="panel-description">{COPY.filtersHint}</p>
              <div className="toggle-grid">
                <ToggleCard checked={hideShorts} label={COPY.hideShorts} onChange={() => setHideShorts((current) => !current)} />
                <ToggleCard checked={unreadOnly} label={COPY.unreadOnly} onChange={() => setUnreadOnly((current) => !current)} />
                <ToggleCard checked={hideMuted} label={COPY.hideMuted} onChange={() => setHideMuted((current) => !current)} />
                <ToggleCard checked={groupTopics} label={COPY.groupTopics} onChange={() => setGroupTopics((current) => !current)} />
              </div>
              <div className="source-settings">
                <div className="subhead-row">
                  <h3>{COPY.sourceSettings}</h3>
                </div>
                <div className="source-control-list">
                  {allSources.map((source) => {
                    const prefs = sourcePrefs[source] || { enabled: true, muted: false };
                    const count = visibleFeed.filter((article) => article.source === source).length;

                    return (
                      <div className="source-control" key={source} title={`${source} の表示設定`}>
                        <div>
                          <strong>{source}</strong>
                          <p>{count} items</p>
                        </div>
                        <div className="source-actions">
                          <button type="button" className={`mini-chip ${prefs.enabled ? "active" : ""}`} onClick={() => toggleSourceEnabled(source)} title={`${source} の表示切替`}>
                            {prefs.enabled ? "表示" : "非表示"}
                          </button>
                          <button type="button" className={`mini-chip ${prefs.muted ? "muted" : ""}`} onClick={() => toggleSourceMuted(source)} title={`${source} のミュート切替`}>
                            {prefs.muted ? "ミュート解除" : "ミュート"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
            <article className="panel glass-card">
              <div className="panel-header">
                <div>
                  <p className="section-kicker">Capture</p>
                  <h2>{COPY.captureTitle}</h2>
                </div>
              </div>
              <p className="panel-description">{COPY.captureHint}</p>
              <div className="form-grid">
                <label className="field">
                  <span>タイトル</span>
                  <input type="text" value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} placeholder="記事タイトル" />
                </label>
                <label className="field">
                  <span>URL</span>
                  <input type="url" value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} placeholder="https://example.com/article" />
                </label>
                <label className="field">
                  <span>ソース</span>
                  <input type="text" value={manualSource} onChange={(event) => setManualSource(event.target.value)} placeholder="ソース名" />
                </label>
              </div>
              <div className="panel-actions">
                <button className="button button-primary" onClick={saveManualNews} disabled={manualSaveLoading}>
                  <ToolbarIcon name="square.and.arrow.down" />
                  <span>{manualSaveLoading ? COPY.manualSaving : COPY.manualSave}</span>
                </button>
              </div>
              {manualSaveMessage ? <p className="inline-success">{manualSaveMessage}</p> : null}
            </article>
          </div>
        </section>
        <section className="detail-layout">
          <article className="content-panel glass-card detail-panel">
            <div className="content-panel-header">
              <div>
                <p className="section-kicker">Workspace</p>
                <h2>{COPY.detailTitle}</h2>
              </div>
              <p>{COPY.detailHint}</p>
            </div>
            {selectedArticle ? (
              <div className="detail-card">
                <div className="article-meta">
                  <span className="source-chip">{selectedArticle.source || COPY.sourceFallback}</span>
                  <span>{formatDateTime(selectedArticle.created_at || selectedArticle.publishedAt)}</span>
                </div>
                <a href={selectedArticle.link} target="_blank" rel="noreferrer" className="article-link detail-link" title={selectedArticle.title}>
                  {selectedArticle.title}
                </a>
                <div className="article-actions">
                  <button className="button button-tertiary" onClick={() => toggleRead(selectedArticle)} title="既読状態を切り替え">
                    {readMap[getArticleKey(selectedArticle)] ? COPY.markUnread : COPY.markRead}
                  </button>
                  <button className="button button-tertiary" onClick={() => toggleLater(selectedArticle)} title="後で読むキューに追加または解除">
                    {laterMap[getArticleKey(selectedArticle)] ? COPY.removeLater : COPY.addLater}
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => summarizeTitle(selectedArticle)}
                    disabled={summaryLoadingMap[getArticleKey(selectedArticle)]}
                    title="タイトルから要点を生成"
                  >
                    {summaryLoadingMap[getArticleKey(selectedArticle)] ? COPY.summarizeLoading : COPY.summarize}
                  </button>
                </div>
                <p className={`article-summary ${summaryMap[getArticleKey(selectedArticle)] ? "filled" : ""}`}>
                  {summaryMap[getArticleKey(selectedArticle)] || selectedArticle.summary || COPY.noSummary}
                </p>
                <label className="note-field">
                  <span>ワークメモ</span>
                  <textarea
                    value={selectedNote}
                    onChange={(event) => updateNote(selectedArticle, event.target.value)}
                    placeholder={COPY.notePlaceholder}
                  />
                </label>
              </div>
            ) : (
              <EmptyState message={COPY.selectPrompt} />
            )}
          </article>
          <article className="content-panel glass-card topic-panel">
            <div className="content-panel-header">
              <div>
                <p className="section-kicker">Topics</p>
                <h2>{COPY.topicsTitle}</h2>
              </div>
              <p>{COPY.topicsHint}</p>
            </div>
            {relatedGroups.length === 0 ? (
              <EmptyState message={COPY.noTopics} />
            ) : (
              <div className="topic-list">
                {relatedGroups.map((group) => (
                  <div className="topic-card" key={group.id}>
                    <strong>{group.label}</strong>
                    <p>{group.items.length} articles</p>
                    <div className="topic-items">
                      {group.items.map((article) => (
                        <button
                          key={getArticleKey(article)}
                          type="button"
                          className="topic-item"
                          onClick={() => setSelectedKey(getArticleKey(article))}
                          title={article.title}
                        >
                          <span>{article.source}</span>
                          <span>{article.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
        <section className="content-stack">
          <article className="content-panel glass-card" id="feed">
            <div className="content-panel-header">
              <div>
                <p className="section-kicker">Live Feed</p>
                <h2>{COPY.feedTitle}</h2>
              </div>
              <p>{COPY.feedHint}</p>
            </div>
            {Object.keys(groupedFeed).length === 0 ? (
              <EmptyState message={COPY.emptyFeed} />
            ) : (
              <div className="source-stack">
                {Object.entries(groupedFeed).map(([source, articles]) => (
                  <details className="source-group" key={source} open>
                    <summary>
                      <div>
                        <h3>{source}</h3>
                        <p>{articles.length} items</p>
                      </div>
                      <ChevronIcon />
                    </summary>
                    <div className="source-body">
                      {articles.map((article) => (
                        <FeedArticleRow
                          article={article}
                          key={getArticleKey(article)}
                          laterMap={laterMap}
                          notesMap={notesMap}
                          onSave={saveNews}
                          onSelect={setSelectedKey}
                          onSummarize={summarizeTitle}
                          onToggleLater={toggleLater}
                          onToggleRead={toggleRead}
                          readMap={readMap}
                          saveLoadingMap={saveLoadingMap}
                          saveMessageMap={saveMessageMap}
                          savedAvailable={isSavedAvailable}
                          summaryLoadingMap={summaryLoadingMap}
                          summaryMap={summaryMap}
                        />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </article>
          <article className="content-panel glass-card" id="queue">
            <div className="content-panel-header">
              <div>
                <p className="section-kicker">Queue</p>
                <h2>{COPY.queueTitle}</h2>
              </div>
              <p>{COPY.queueHint}</p>
            </div>
            <ArticleList
              emptyMessage={COPY.emptyQueue}
              items={queueItems.map(withSearchBucket("queue"))}
              laterMap={laterMap}
              notesMap={notesMap}
              onSelect={setSelectedKey}
              readMap={readMap}
            />
          </article>
          <article className="content-panel glass-card" id="library">
            <div className="content-panel-header">
              <div>
                <p className="section-kicker">Library</p>
                <h2>{COPY.libraryTitle}</h2>
              </div>
              <p>{COPY.libraryHint}</p>
            </div>
            {isSavedAvailable ? (
              <ArticleList
                emptyMessage={COPY.emptyLibrary}
                items={visibleSaved.map(withSearchBucket("saved"))}
                laterMap={laterMap}
                notesMap={notesMap}
                onSelect={setSelectedKey}
                readMap={readMap}
              />
            ) : (
              <EmptyState message={COPY.savedUnavailable} />
            )}
          </article>
        </section>
        {selectedArticle ? (
          <aside className="mobile-drawer" aria-label="記事詳細ドロワー">
            <div className="mobile-drawer-header">
              <div>
                <p>記事詳細</p>
                <strong>{selectedArticle.source || COPY.sourceFallback}</strong>
              </div>
              <button
                type="button"
                className="button button-tertiary mobile-close"
                onClick={() => setSelectedKey("")}
                title="詳細を閉じる"
              >
                閉じる
              </button>
            </div>
            <a
              href={selectedArticle.link}
              target="_blank"
              rel="noreferrer"
              className="article-link detail-link"
              title={selectedArticle.title}
            >
              {selectedArticle.title}
            </a>
            <p className={`article-summary ${summaryMap[getArticleKey(selectedArticle)] ? "filled" : ""}`}>
              {summaryMap[getArticleKey(selectedArticle)] || selectedArticle.summary || COPY.noSummary}
            </p>
            <div className="article-actions">
              <button className="button button-tertiary" onClick={() => toggleRead(selectedArticle)}>
                {readMap[getArticleKey(selectedArticle)] ? COPY.markUnread : COPY.markRead}
              </button>
              <button className="button button-tertiary" onClick={() => toggleLater(selectedArticle)}>
                {laterMap[getArticleKey(selectedArticle)] ? COPY.removeLater : COPY.addLater}
              </button>
              <a className="button button-secondary" href={selectedArticle.link} target="_blank" rel="noreferrer">
                {COPY.open}
              </a>
            </div>
          </aside>
        ) : null}
        <nav className="mobile-tabbar" aria-label="モバイルナビゲーション">
          <a href="#search">検索</a>
          <a href="#filters">整理</a>
          <a href="#feed">フィード</a>
          <a href="#queue">後で読む</a>
          <a href="#library">保存済み</a>
        </nav>
      </section>
    </main>
  );
}

function MetricPill({ label, value }) {
  return (
    <div className="info-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ToggleCard({ checked, label, onChange }) {
  return (
    <button type="button" className={`toggle-card ${checked ? "active" : ""}`} onClick={onChange}>
      <span>{label}</span>
      <strong>{checked ? "ON" : "OFF"}</strong>
    </button>
  );
}

function FeedArticleRow({
  article,
  onSave,
  onSelect,
  onSummarize,
  onToggleLater,
  onToggleRead,
  summaryMap,
  summaryLoadingMap,
  saveLoadingMap,
  saveMessageMap,
  readMap,
  laterMap,
  notesMap,
  savedAvailable
}) {
  const key = getArticleKey(article);

  return (
    <article className={`article-row ${readMap[key] ? "read" : ""}`}>
      <div className="article-copy">
        <div className="article-meta">
          <span className="source-chip" title={article.source || COPY.sourceFallback}>{article.source || COPY.sourceFallback}</span>
          <span>{formatDateTime(article.publishedAt)}</span>
          {notesMap[key] ? <span className="meta-badge">メモあり</span> : null}
          {laterMap[key] ? <span className="meta-badge">後で読む</span> : null}
        </div>
        <a href={article.link} target="_blank" rel="noreferrer" className="article-link" title={article.title}>
          {article.title}
        </a>
        <p className={`article-summary ${summaryMap[key] ? "filled" : ""}`}>
          {summaryMap[key] || COPY.noSummary}
        </p>
        {saveMessageMap[key] ? <p className="inline-success">{saveMessageMap[key]}</p> : null}
      </div>
      <div className="article-actions">
        <button className="button button-tertiary" onClick={() => onSelect(key)} title="右側のワークスペースで詳細を開く">
          {COPY.detail}
        </button>
        <button className="button button-tertiary" onClick={() => onToggleRead(article)} title="既読状態を切り替え">
          {readMap[key] ? COPY.markUnread : COPY.markRead}
        </button>
        <button className="button button-tertiary" onClick={() => onToggleLater(article)} title="後で読むキューに追加または解除">
          {laterMap[key] ? COPY.removeLater : COPY.addLater}
        </button>
        <button
          className="button button-secondary"
          onClick={() => onSummarize(article)}
          disabled={summaryLoadingMap[key]}
          title="タイトルから要点を生成"
        >
          {summaryLoadingMap[key] ? COPY.summarizeLoading : COPY.summarize}
        </button>
        <button
          className="button button-secondary"
          onClick={() => onSave(article)}
          disabled={saveLoadingMap[key] || !savedAvailable}
          title="保存ライブラリに追加"
        >
          {saveLoadingMap[key] ? COPY.saveLoading : COPY.save}
        </button>
        <a className="button button-tertiary" href={article.link} target="_blank" rel="noreferrer" title="元記事を開く">
          {COPY.open}
        </a>
      </div>
    </article>
  );
}

function ArticleList({ items, emptyMessage, laterMap, notesMap, onSelect, readMap }) {
  if (items.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="article-list">
      {items.map((article) => {
        const key = getArticleKey(article);

        return (
          <article className={`library-item ${readMap[key] ? "read" : ""}`} key={article.id || key}>
            <div className="article-meta">
              <span className="source-chip" title={article.source || COPY.sourceFallback}>{article.source || COPY.sourceFallback}</span>
              <span>
                {article.searchBucket ? `${article.searchBucket} · ` : ""}
                {formatDateTime(article.created_at || article.publishedAt)}
              </span>
              {notesMap[key] ? <span className="meta-badge">メモあり</span> : null}
              {laterMap[key] ? <span className="meta-badge">後で読む</span> : null}
            </div>
            <a href={article.link} target="_blank" rel="noreferrer" className="article-link" title={article.title}>
              {article.title}
            </a>
            <p className={`article-summary ${article.summary ? "filled" : ""}`}>
              {article.summary || COPY.noSummary}
            </p>
            <div className="article-actions">
              <button className="button button-tertiary" onClick={() => onSelect(key)} title="右側のワークスペースで詳細を開く">
                {COPY.detail}
              </button>
              <a className="button button-tertiary" href={article.link} target="_blank" rel="noreferrer" title="元記事を開く">
                {COPY.open}
              </a>
            </div>
          </article>
        );
      })}
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

function withSearchBucket(scope) {
  return (article) => ({
    ...article,
    searchBucket:
      scope === "feed"
        ? "フィード"
        : scope === "saved"
          ? "保存済み"
          : scope === "queue"
            ? "後で読む"
            : scope === "unread"
              ? "未読"
              : "すべて"
  });
}

function readStorage(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function isArticleVisible(article, sourcePrefs, hideMuted, hideShorts) {
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

function getArticleKey(article) {
  return article.id ? `${article.id}-${article.link}` : `${article.source}-${article.link}`;
}

function dedupeArticles(items) {
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

function buildTopicGroups(items) {
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

function formatDateTime(value) {
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
    "arrow.down.circle.fill": (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v8" />
        <path d="M8.75 12.75 12 16l3.25-3.25" />
      </>
    ),
    "bookmark.circle": (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M10 8.25A1.25 1.25 0 0 1 11.25 7h1.5A1.25 1.25 0 0 1 14 8.25V15l-2-1.3L10 15V8.25Z" />
      </>
    ),
    "square.and.arrow.down": (
      <>
        <path d="M7 12.75V17h10v-4.25" />
        <path d="M12 5v9" />
        <path d="M8.75 10.75 12 14l3.25-3.25" />
      </>
    )
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="toolbar-icon">
      {icons[name]}
    </svg>
  );
}
