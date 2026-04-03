import { formatDateTime, getArticleKey } from "../lib/article-utils";
import { COPY } from "../lib/workspace-copy";
import { SectionHeader } from "./section-header";

export function DetailWorkspace({
  EmptyState,
  laterMap,
  notesMap,
  onSelectArticle,
  onSummarize,
  onToggleLater,
  onToggleRead,
  onUpdateNote,
  readMap,
  relatedGroups,
  selectedArticle,
  selectedNote,
  summaryLoadingMap,
  summaryMap
}) {
  return (
    <section className="detail-layout">
      <article className="content-panel glass-card detail-panel">
        <SectionHeader
          className="content-panel-header"
          kicker="Workspace"
          title={COPY.detailTitle}
          description={COPY.detailHint}
        />
        {selectedArticle ? (
          <div className="detail-card">
            <div className="article-meta">
              <span className="source-chip">{selectedArticle.source || COPY.sourceFallback}</span>
              <span>{formatDateTime(selectedArticle.created_at || selectedArticle.publishedAt)}</span>
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
            <div className="article-actions">
              <button
                className="button button-tertiary"
                onClick={() => onToggleRead(selectedArticle)}
                title="既読状態を切り替え"
              >
                {readMap[getArticleKey(selectedArticle)] ? COPY.markUnread : COPY.markRead}
              </button>
              <button
                className="button button-tertiary"
                onClick={() => onToggleLater(selectedArticle)}
                title="後で読むキューに追加または解除"
              >
                {laterMap[getArticleKey(selectedArticle)] ? COPY.removeLater : COPY.addLater}
              </button>
              <button
                className="button button-secondary"
                onClick={() => onSummarize(selectedArticle)}
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
                onChange={(event) => onUpdateNote(selectedArticle, event.target.value)}
                placeholder={COPY.notePlaceholder}
              />
            </label>
          </div>
        ) : (
          <EmptyState message={COPY.selectPrompt} />
        )}
      </article>
      <article className="content-panel glass-card topic-panel">
        <SectionHeader
          className="content-panel-header"
          kicker="Topics"
          title={COPY.topicsTitle}
          description={COPY.topicsHint}
        />
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
                      onClick={() => onSelectArticle(getArticleKey(article))}
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
  );
}
