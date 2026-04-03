"use client";

import { formatDateTime, getArticleKey } from "../lib/article-utils";
import { COPY } from "../lib/workspace-copy";
import { useNewsWorkspace } from "../hooks/use-news-workspace";

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
          <article className="panel glass-card" id="search">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Search</p>
                <h2>{COPY.searchTitle}</h2>
              </div>
              <button
                type="button"
                className="section-toggle"
                onClick={() => setIsSearchCollapsed((current) => !current)}
                aria-expanded={!isSearchCollapsed}
                aria-controls="search-panel-body"
                title={isSearchCollapsed ? "検索欄を開く" : "検索欄を閉じる"}
              >
                {isSearchCollapsed ? "開く" : "閉じる"}
              </button>
            </div>
            {!isSearchCollapsed ? (
              <div id="search-panel-body">
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
              </div>
            ) : null}
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
              <button
                type="button"
                className="section-toggle"
                onClick={() => setIsFeedCollapsed((current) => !current)}
                aria-expanded={!isFeedCollapsed}
                aria-controls="feed-panel-body"
                title={isFeedCollapsed ? "今日のフィードを開く" : "今日のフィードを閉じる"}
              >
                {isFeedCollapsed ? "開く" : "閉じる"}
              </button>
            </div>
            {!isFeedCollapsed ? (
              <div id="feed-panel-body">
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
                          {(expandedSources[source] ? articles : articles.slice(0, 3)).map((article) => (
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
                          {articles.length > 3 ? (
                            <button
                              type="button"
                              className="button button-tertiary source-expand"
                              onClick={() =>
                                setExpandedSources((current) => ({
                                  ...current,
                                  [source]: !current[source]
                                }))
                              }
                              title={
                                expandedSources[source]
                                  ? `${source} の一覧を3件表示に戻す`
                                  : `${source} の記事をすべて表示する`
                              }
                            >
                              {expandedSources[source]
                                ? "3件表示に戻す"
                                : `もっと見る (${articles.length - 3}件)`}
                            </button>
                          ) : null}
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
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
