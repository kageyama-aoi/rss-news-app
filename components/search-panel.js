import { COPY } from "../lib/workspace-copy";
import { SectionHeader } from "./section-header";

const SEARCH_SCOPES = [
  ["all", "すべて"],
  ["feed", "フィード"],
  ["saved", "保存済み"],
  ["queue", "後で読む"],
  ["unread", "未読"]
];

export function SearchPanel({
  applySavedView,
  ArticleList,
  clearSearch,
  emptyMessage,
  idleMessage,
  isCollapsed,
  laterMap,
  notesMap,
  onKeywordChange,
  onRemoveSavedView,
  onSaveCurrentView,
  onScopeChange,
  onSelect,
  onToggleCollapsed,
  onViewNameChange,
  readMap,
  savedViews,
  scope,
  searchKeyword,
  searchResults,
  viewName
}) {
  return (
    <article className="panel glass-card" id="search">
      <SectionHeader
        className="panel-header"
        kicker="Search"
        title={COPY.searchTitle}
        collapsed={isCollapsed}
        controlsId="search-panel-body"
        onToggle={onToggleCollapsed}
        openLabel="検索欄を開く"
        closeLabel="検索欄を閉じる"
      />
      {!isCollapsed ? (
        <div id="search-panel-body">
          <p className="panel-description">{COPY.searchHint}</p>
          <div className="scope-row" role="tablist" aria-label="検索対象">
            {SEARCH_SCOPES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`scope-chip ${scope === value ? "active" : ""}`}
                onClick={() => onScopeChange(value)}
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
                onChange={(event) => onKeywordChange(event.target.value)}
                placeholder={COPY.searchPlaceholder}
              />
            </label>
            <button
              className="button button-tertiary"
              onClick={clearSearch}
              disabled={!searchKeyword && scope === "all"}
            >
              {COPY.clear}
            </button>
          </div>
          <div className="saved-view-row">
            <label className="inline-field">
              <input
                type="text"
                value={viewName}
                onChange={(event) => onViewNameChange(event.target.value)}
                placeholder="例: AIニュースだけ"
              />
            </label>
            <button
              className="button button-secondary"
              onClick={onSaveCurrentView}
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
                  <button type="button" onClick={() => onRemoveSavedView(view.id)} title={`${view.name} を削除`}>
                    削除
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <p className="search-summary">検索結果: {searchResults.length}</p>
          {searchKeyword.trim() || scope !== "all" ? (
            <ArticleList
              items={searchResults}
              emptyMessage={emptyMessage}
              laterMap={laterMap}
              notesMap={notesMap}
              onSelect={onSelect}
              readMap={readMap}
            />
          ) : (
            idleMessage
          )}
        </div>
      ) : null}
    </article>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </svg>
  );
}
