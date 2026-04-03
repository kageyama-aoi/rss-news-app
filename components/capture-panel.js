import { COPY } from "../lib/workspace-copy";
import { SectionHeader } from "./section-header";

export function CapturePanel({
  ToolbarIcon,
  manualSaveLoading,
  manualSaveMessage,
  manualSource,
  manualTitle,
  manualUrl,
  onManualSourceChange,
  onManualTitleChange,
  onManualUrlChange,
  onSave
}) {
  return (
    <article className="panel glass-card">
      <SectionHeader className="panel-header" kicker="Capture" title={COPY.captureTitle} />
      <p className="panel-description">{COPY.captureHint}</p>
      <div className="form-grid">
        <label className="field">
          <span>タイトル</span>
          <input
            type="text"
            value={manualTitle}
            onChange={(event) => onManualTitleChange(event.target.value)}
            placeholder="記事タイトル"
          />
        </label>
        <label className="field">
          <span>URL</span>
          <input
            type="url"
            value={manualUrl}
            onChange={(event) => onManualUrlChange(event.target.value)}
            placeholder="https://example.com/article"
          />
        </label>
        <label className="field">
          <span>ソース</span>
          <input
            type="text"
            value={manualSource}
            onChange={(event) => onManualSourceChange(event.target.value)}
            placeholder="ソース名"
          />
        </label>
      </div>
      <div className="panel-actions">
        <button className="button button-primary" onClick={onSave} disabled={manualSaveLoading}>
          <ToolbarIcon name="square.and.arrow.down" />
          <span>{manualSaveLoading ? COPY.manualSaving : COPY.manualSave}</span>
        </button>
      </div>
      {manualSaveMessage ? <p className="inline-success">{manualSaveMessage}</p> : null}
    </article>
  );
}
