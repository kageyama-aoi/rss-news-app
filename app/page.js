"use client";

import { formatDateTime, getArticleKey } from "../lib/article-utils";
import { COPY } from "../lib/workspace-copy";
import { useNewsWorkspace } from "../hooks/use-news-workspace";
import { DetailWorkspace } from "../components/detail-workspace";
import { FeedSection } from "../components/feed-section";
import { SearchPanel } from "../components/search-panel";

export default function HomePage() {
  const {
    activeStatus,
    allSources,
    applySavedView,
    clearSearch,
    error,
    expandedSources,
    fetchedAt,
    groupTopics,
    groupedFeed,
    hideMuted,
    hideShorts,
    isDesktopNavOpen,
    isFeedCollapsed,
    isSavedAvailable,
    isSearchCollapsed,
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
    relatedGroups,
    removeSavedView,
    saveCurrentView,
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
    setGroupTopics,
    setHideMuted,
    setHideShorts,
    setIsDesktopNavOpen,
    setIsFeedCollapsed,
    setIsSearchCollapsed,
    setManualSource,
    setManualTitle,
    setManualUrl,
    setSearchKeyword,
    setSearchScope,
    setSelectedKey,
    setUnreadOnly,
    setViewName,
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
    viewName,
    visibleFeed,
    visibleSaved
  } = useNewsWorkspace();

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
          <SearchPanel
            applySavedView={applySavedView}
            ArticleList={ArticleList}
            clearSearch={clearSearch}
            emptyMessage={COPY.emptySearch}
            idleMessage={<EmptyState message={COPY.idleSearch} />}
            isCollapsed={isSearchCollapsed}
            laterMap={laterMap}
            notesMap={notesMap}
            onKeywordChange={setSearchKeyword}
            onRemoveSavedView={removeSavedView}
            onSaveCurrentView={saveCurrentView}
            onScopeChange={setSearchScope}
            onSelect={setSelectedKey}
            onToggleCollapsed={() => setIsSearchCollapsed((current) => !current)}
            onViewNameChange={setViewName}
            readMap={readMap}
            savedViews={savedViews}
            scope={searchScope}
            searchKeyword={searchKeyword}
            searchResults={searchResults}
            viewName={viewName}
          />
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
        <DetailWorkspace
          EmptyState={EmptyState}
          laterMap={laterMap}
          notesMap={notesMap}
          onSelectArticle={setSelectedKey}
          onSummarize={summarizeTitle}
          onToggleLater={toggleLater}
          onToggleRead={toggleRead}
          onUpdateNote={updateNote}
          readMap={readMap}
          relatedGroups={relatedGroups}
          selectedArticle={selectedArticle}
          selectedNote={selectedNote}
          summaryLoadingMap={summaryLoadingMap}
          summaryMap={summaryMap}
        />
        <section className="content-stack">
          <FeedSection
            FeedArticleRow={FeedArticleRow}
            groupedFeed={groupedFeed}
            expandedSources={expandedSources}
            isCollapsed={isFeedCollapsed}
            laterMap={laterMap}
            notesMap={notesMap}
            onSelect={setSelectedKey}
            onSave={saveNews}
            onSummarize={summarizeTitle}
            onToggleCollapsed={() => setIsFeedCollapsed((current) => !current)}
            onToggleLater={toggleLater}
            onToggleRead={toggleRead}
            onToggleSourceExpanded={(source) =>
              setExpandedSources((current) => ({
                ...current,
                [source]: !current[source]
              }))
            }
            readMap={readMap}
            renderEmpty={(message) => <EmptyState message={message} />}
            saveLoadingMap={saveLoadingMap}
            saveMessageMap={saveMessageMap}
            savedAvailable={isSavedAvailable}
            summaryLoadingMap={summaryLoadingMap}
            summaryMap={summaryMap}
          />
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
