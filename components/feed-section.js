import { getArticleKey } from "../lib/article-utils";
import { COPY } from "../lib/workspace-copy";
import { SectionHeader } from "./section-header";

export function FeedSection({
  FeedArticleRow,
  groupedFeed,
  expandedSources,
  isCollapsed,
  laterMap,
  notesMap,
  onSelect,
  onSave,
  onSummarize,
  onToggleCollapsed,
  onToggleLater,
  onToggleRead,
  onToggleSourceExpanded,
  readMap,
  renderEmpty,
  saveLoadingMap,
  saveMessageMap,
  savedAvailable,
  summaryLoadingMap,
  summaryMap
}) {
  return (
    <article className="content-panel glass-card" id="feed">
      <SectionHeader
        className="content-panel-header"
        kicker="Live Feed"
        title={COPY.feedTitle}
        description={COPY.feedHint}
        collapsed={isCollapsed}
        controlsId="feed-panel-body"
        onToggle={onToggleCollapsed}
        openLabel="今日のフィードを開く"
        closeLabel="今日のフィードを閉じる"
      />
      {!isCollapsed ? (
        <div id="feed-panel-body">
          {Object.keys(groupedFeed).length === 0 ? (
            renderEmpty(COPY.emptyFeed)
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
                        onSave={onSave}
                        onSelect={onSelect}
                        onSummarize={onSummarize}
                        onToggleLater={onToggleLater}
                        onToggleRead={onToggleRead}
                        readMap={readMap}
                        saveLoadingMap={saveLoadingMap}
                        saveMessageMap={saveMessageMap}
                        savedAvailable={savedAvailable}
                        summaryLoadingMap={summaryLoadingMap}
                        summaryMap={summaryMap}
                      />
                    ))}
                    {articles.length > 3 ? (
                      <button
                        type="button"
                        className="button button-tertiary source-expand"
                        onClick={() => onToggleSourceExpanded(source)}
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
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="chevron-icon">
      <path d="M6 8l4 4 4-4" />
    </svg>
  );
}
