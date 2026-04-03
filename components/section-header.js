export function SectionHeader({
  className,
  kicker,
  title,
  description,
  collapsed,
  controlsId,
  onToggle,
  openLabel,
  closeLabel
}) {
  return (
    <div className={className}>
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2>{title}</h2>
      </div>
      {description ? <p>{description}</p> : null}
      {onToggle ? (
        <button
          type="button"
          className="section-toggle"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-controls={controlsId}
          title={collapsed ? openLabel : closeLabel}
        >
          {collapsed ? "開く" : "閉じる"}
        </button>
      ) : null}
    </div>
  );
}
