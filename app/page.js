"use client";

import { formatDateTime, getArticleKey } from "../lib/article-utils";
import { COPY } from "../lib/workspace-copy";
import { useNewsWorkspace } from "../hooks/use-news-workspace";

export default function HomePage() {
  const {
    activeTab,
    setActiveTab,
    allSources,
    clearSearch,
    error,
    expandedSources,
    fetchedAt,
    groupTopics,
    groupedFeed,
    hideMuted,
    hideShorts,
    isFilterCollapsed,
    isSavedAvailable,
    laterMap,
    loadNews,
    loadSavedNews,
    loading,
    manualSaveLoading,
    manualSaveMessage,
    manualSource,
    manualTitle,
    manualUrl,
    notesMap,
    queueItems,
    readMap,
    saveLoadingMap,
    saveManualNews,
    saveMessageMap,
    saveNews,
    savedError,
    savedLoading,
    savedViews,
    searchKeyword,
    searchResults,
    searchScope,
    selectedArticle,
    selectedNote,
    setExpandedSources,
    setFilterCollapsed,
    setGroupTopics,
    setHideMuted,
    setHideShorts,
    setManualSource,
    setManualTitle,
    setManualUrl,
    setSearchKeyword,
    setSearchScope,
    setSelectedKey,
    setUnreadOnly,
    sourcePrefs,
    summarizeTitle,
    summaryLoadingMap,
    summaryMap,
    toggleLater,
    toggleRead,
    toggleSourceEnabled,
    toggleSourceMuted,
    unreadCount,
    unreadOnly,
    updateNote,
    visibleFeed,
    visibleSaved
  } = useNewsWorkspace();

  const isSearchActive = searchKeyword.trim().length > 0;

  const handleSearchChange = (value) => {
    setSearchKeyword(value);
    if (value.trim()) {
      setActiveTab("search");
    } else {
      setActiveTab("feed");
    }
  };

  const handleClearSearch = () => {
    clearSearch();
    setActiveTab("feed");
  };

  return (
    <div className="app-shell">
      {/* ── スリムヘッダー ── */}
      <header className="app-header glass-card">
        <span className="app-title">My Feed</span>
        <div className="header-search-wrap">
          <SearchIcon />
          <input
            className="header-search-input"
            type="search"
            placeholder="記事を検索..."
            value={searchKeyword}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="記事を検索"
          />
          {searchKeyword && (
            <button
              type="button"
              className="search-clear"
              onClick={handleClearSearch}
              aria-label="検索をクリア"
            >
              ✕
            </button>
          )}
        </div>
        <div className="header-actions">
          <button
            type="button"
            className={`header-btn ${!isFilterCollapsed ? "active" : ""}`}
            onClick={() => setFilterCollapsed((c) => !c)}
            title="フィルター設定"
            aria-label="フィルター設定"
          >
            <FilterIcon />
          </button>
          <button
            type="button"
            className="header-btn"
            onClick={loadNews}
            disabled={loading}
            title="フィードを更新"
            aria-label="フィードを更新"
          >
            <RefreshIcon spinning={loading} />
          </button>
        </div>
      </header>

      {/* ── フィルターパネル ── */}
      {!isFilterCollapsed && (
        <div className="filter-panel glass-card">
          <div className="filter-panel-inner">
            <div className="filter-toggles">
              <ToggleChip checked={hideShorts} label="Shorts 非表示" onChange={() => setHideShorts((c) => !c)} />
              <ToggleChip checked={unreadOnly} label="未読のみ" onChange={() => setUnreadOnly((c) => !c)} />
              <ToggleChip checked={hideMuted} label="ミュート非表示" onChange={() => setHideMuted((c) => !c)} />
              <ToggleChip checked={groupTopics} label="トピックまとめ" onChange={() => setGroupTopics((c) => !c)} />
            </div>
            <div className="filter-sources">
              {allSources.map((source) => {
                const prefs = sourcePrefs[source] || { enabled: true, muted: false };
                return (
                  <div className="filter-source-row" key={source}>
                    <span>{source}</span>
                    <div>
                      <button
                        type="button"
                        className={`mini-chip ${prefs.enabled ? "active" : ""}`}
                        onClick={() => toggleSourceEnabled(source)}
                      >
                        {prefs.enabled ? "表示" : "非表示"}
                      </button>
                      <button
                        type="button"
                        className={`mini-chip ${prefs.muted ? "muted" : ""}`}
                        onClick={() => toggleSourceMuted(source)}
                      >
                        {prefs.muted ? "解除" : "ミュート"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── タブナビゲーション ── */}
      <nav className="tab-nav" aria-label="メインナビゲーション">
        <button
          type="button"
          className={`tab-btn ${activeTab === "feed" ? "active" : ""}`}
          onClick={() => { setActiveTab("feed"); handleClearSearch(); }}
        >
          フィード
          {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "queue" ? "active" : ""}`}
          onClick={() => { setActiveTab("queue"); handleClearSearch(); }}
        >
          後で読む
          {queueItems.length > 0 && <span className="tab-badge">{queueItems.length}</span>}
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "library" ? "active" : ""}`}
          onClick={() => { setActiveTab("library"); handleClearSearch(); }}
        >
          保存済み
        </button>
      </nav>

      {/* ── エラー ── */}
      {(error || savedError) && (
        <div className="error-banner" role="alert">
          {error && <p>{error}</p>}
          {savedError && <p>{savedError}</p>}
        </div>
      )}

      {/* ── メインコンテンツ ── */}
      <main className="tab-content">

        {/* 検索結果 */}
        {isSearchActive && (
          <div className="article-list">
            {searchResults.length === 0 ? (
              <p className="empty-msg">「{searchKeyword}」に一致する記事はありません</p>
            ) : (
              searchResults.map((article) => (
                <ArticleRow
                  key={getArticleKey(article)}
                  article={article}
                  readMap={readMap}
                  laterMap={laterMap}
                  notesMap={notesMap}
                  onSelect={setSelectedKey}
                  onToggleRead={toggleRead}
                  onToggleLater={toggleLater}
                />
              ))
            )}
          </div>
        )}

        {/* フィード */}
        {!isSearchActive && activeTab === "feed" && (
          Object.keys(groupedFeed).length === 0
            ? <p className="empty-msg">{loading ? "読み込み中..." : COPY.emptyFeed}</p>
            : <div className="source-stack">
                {Object.entries(groupedFeed).map(([source, articles]) => (
                  <section key={source} className="source-group">
                    <button
                      type="button"
                      className="source-group-header"
                      onClick={() =>
                        setExpandedSources((cur) => ({ ...cur, [source]: !cur[source] }))
                      }
                    >
                      <span className="source-name">{source}</span>
                      <span className="source-count">{articles.length}件</span>
                      <ChevronIcon open={expandedSources[source] !== false} />
                    </button>
                    {expandedSources[source] !== false && (
                      <div className="article-list">
                        {(expandedSources[source] === true ? articles : articles.slice(0, 3)).map((article) => (
                          <ArticleRow
                            key={getArticleKey(article)}
                            article={article}
                            readMap={readMap}
                            laterMap={laterMap}
                            notesMap={notesMap}
                            onSelect={setSelectedKey}
                            onToggleRead={toggleRead}
                            onToggleLater={toggleLater}
                          />
                        ))}
                        {articles.length > 3 && expandedSources[source] !== true && (
                          <button
                            type="button"
                            className="load-more"
                            onClick={() =>
                              setExpandedSources((cur) => ({ ...cur, [source]: true }))
                            }
                          >
                            もっと見る（残り {articles.length - 3} 件）
                          </button>
                        )}
                      </div>
                    )}
                  </section>
                ))}
              </div>
        )}

        {/* 後で読む */}
        {!isSearchActive && activeTab === "queue" && (
          queueItems.length === 0
            ? <p className="empty-msg">{COPY.emptyQueue}</p>
            : <div className="article-list">
                {queueItems.map((article) => (
                  <ArticleRow
                    key={getArticleKey(article)}
                    article={article}
                    readMap={readMap}
                    laterMap={laterMap}
                    notesMap={notesMap}
                    onSelect={setSelectedKey}
                    onToggleRead={toggleRead}
                    onToggleLater={toggleLater}
                  />
                ))}
              </div>
        )}

        {/* 保存済み */}
        {!isSearchActive && activeTab === "library" && (
          !isSavedAvailable
            ? <p className="empty-msg">{COPY.savedUnavailable}</p>
            : visibleSaved.length === 0
              ? <p className="empty-msg">{COPY.emptyLibrary}</p>
              : <div className="article-list">
                  {visibleSaved.map((article) => (
                    <ArticleRow
                      key={getArticleKey(article)}
                      article={article}
                      readMap={readMap}
                      laterMap={laterMap}
                      notesMap={notesMap}
                      onSelect={setSelectedKey}
                      onToggleRead={toggleRead}
                      onToggleLater={toggleLater}
                    />
                  ))}
                </div>
        )}
      </main>

      {/* ── 記事詳細ドロワー ── */}
      {selectedArticle && (
        <>
          <div
            className="drawer-scrim"
            onClick={() => setSelectedKey("")}
            aria-hidden="true"
          />
          <aside className="article-drawer glass-card">
            <div className="drawer-header">
              <span className="source-chip">{selectedArticle.source || COPY.sourceFallback}</span>
              <button
                type="button"
                className="drawer-close"
                onClick={() => setSelectedKey("")}
                aria-label="詳細を閉じる"
              >
                ✕
              </button>
            </div>
            <a
              href={selectedArticle.link}
              target="_blank"
              rel="noreferrer"
              className="drawer-title"
            >
              {selectedArticle.title}
            </a>
            <p className="drawer-meta">
              {formatDateTime(selectedArticle.publishedAt || selectedArticle.created_at)}
            </p>
            <div className="drawer-actions">
              <button
                type="button"
                className={`action-btn ${readMap[getArticleKey(selectedArticle)] ? "active" : ""}`}
                onClick={() => toggleRead(selectedArticle)}
              >
                {readMap[getArticleKey(selectedArticle)] ? "未読に戻す" : "既読にする"}
              </button>
              <button
                type="button"
                className={`action-btn ${laterMap[getArticleKey(selectedArticle)] ? "active" : ""}`}
                onClick={() => toggleLater(selectedArticle)}
              >
                {laterMap[getArticleKey(selectedArticle)] ? "後で読むから外す" : "後で読む"}
              </button>
              {isSavedAvailable && (
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => saveNews(selectedArticle)}
                  disabled={saveLoadingMap[getArticleKey(selectedArticle)]}
                >
                  {saveLoadingMap[getArticleKey(selectedArticle)] ? "保存中..." : "保存する"}
                </button>
              )}
              <button
                type="button"
                className="action-btn action-btn-ai"
                onClick={() => summarizeTitle(selectedArticle)}
                disabled={summaryLoadingMap[getArticleKey(selectedArticle)]}
              >
                {summaryLoadingMap[getArticleKey(selectedArticle)] ? "要約中..." : "AI 要約"}
              </button>
            </div>
            {summaryMap[getArticleKey(selectedArticle)] && (
              <p className="drawer-summary">{summaryMap[getArticleKey(selectedArticle)]}</p>
            )}
            {saveMessageMap[getArticleKey(selectedArticle)] && (
              <p className="drawer-save-msg">{saveMessageMap[getArticleKey(selectedArticle)]}</p>
            )}
            <label className="drawer-note-label">
              メモ
              <textarea
                className="drawer-note"
                value={selectedNote}
                onChange={(e) => updateNote(selectedArticle, e.target.value)}
                placeholder="メモを書く..."
                rows={3}
              />
            </label>
          </aside>
        </>
      )}
    </div>
  );
}

/* ── 記事行（コンパクト） ── */
function ArticleRow({ article, readMap, laterMap, notesMap, onSelect, onToggleRead, onToggleLater }) {
  const key = getArticleKey(article);
  return (
    <article className={`article-row ${readMap[key] ? "is-read" : ""}`}>
      <button
        type="button"
        className="article-row-main"
        onClick={() => onSelect(key)}
      >
        <span className="article-row-title">{article.title}</span>
        <span className="article-row-meta">
          {article.source && <span className="source-chip-sm">{article.source}</span>}
          <span>{formatDateTime(article.publishedAt || article.created_at)}</span>
          {notesMap[key] && <span className="badge">メモ</span>}
        </span>
      </button>
      <div className="article-row-actions">
        <button
          type="button"
          className={`row-action-btn ${laterMap[key] ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleLater(article); }}
          title={laterMap[key] ? "後で読むから外す" : "後で読む"}
          aria-label={laterMap[key] ? "後で読むから外す" : "後で読む"}
        >
          ★
        </button>
        <button
          type="button"
          className={`row-action-btn ${readMap[key] ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onToggleRead(article); }}
          title={readMap[key] ? "未読に戻す" : "既読にする"}
          aria-label={readMap[key] ? "未読に戻す" : "既読にする"}
        >
          ✓
        </button>
        <a
          className="row-action-btn"
          href={article.link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="元記事を開く"
          aria-label="元記事を開く"
        >
          ↗
        </a>
      </div>
    </article>
  );
}

/* ── 小さいトグルチップ ── */
function ToggleChip({ checked, label, onChange }) {
  return (
    <button
      type="button"
      className={`toggle-chip ${checked ? "active" : ""}`}
      onClick={onChange}
    >
      {label}
    </button>
  );
}

/* ── アイコン ── */
function SearchIcon() {
  return (
    <svg className="search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="btn-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RefreshIcon({ spinning }) {
  return (
    <svg
      className={`btn-icon ${spinning ? "spinning" : ""}`}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16.5 10a6.5 6.5 0 1 1-1.6-4.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M14 4l1.5 2-2 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`chevron ${open ? "open" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
