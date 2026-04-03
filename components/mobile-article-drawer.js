import { getArticleKey } from "../lib/article-utils";
import { COPY } from "../lib/workspace-copy";

export function MobileArticleDrawer({
  laterMap,
  onClose,
  onToggleLater,
  onToggleRead,
  readMap,
  selectedArticle,
  summaryMap
}) {
  if (!selectedArticle) {
    return null;
  }

  const articleKey = getArticleKey(selectedArticle);

  return (
    <aside className="mobile-drawer" aria-label="記事詳細ドロワー">
      <div className="mobile-drawer-header">
        <div>
          <p>記事詳細</p>
          <strong>{selectedArticle.source || COPY.sourceFallback}</strong>
        </div>
        <button
          type="button"
          className="button button-tertiary mobile-close"
          onClick={onClose}
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
      <p className={`article-summary ${summaryMap[articleKey] ? "filled" : ""}`}>
        {summaryMap[articleKey] || selectedArticle.summary || COPY.noSummary}
      </p>
      <div className="article-actions">
        <button className="button button-tertiary" onClick={() => onToggleRead(selectedArticle)}>
          {readMap[articleKey] ? COPY.markUnread : COPY.markRead}
        </button>
        <button className="button button-tertiary" onClick={() => onToggleLater(selectedArticle)}>
          {laterMap[articleKey] ? COPY.removeLater : COPY.addLater}
        </button>
        <a className="button button-secondary" href={selectedArticle.link} target="_blank" rel="noreferrer">
          {COPY.open}
        </a>
      </div>
    </aside>
  );
}
