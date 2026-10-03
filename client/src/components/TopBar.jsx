import OverlayMenu from './OverlayMenu.jsx';

export default function TopBar({
  user,
  basemapName,
  overlayIds,
  onOverlayIdsChange,
  onOpenBasemaps,
  onToggleSidebar,
  onLogout,
}) {
  return (
    <header className="topbar">
      <button type="button" className="icon-btn only-mobile" aria-label="Vis listen" onClick={onToggleSidebar}>
        ☰
      </button>
      <span className="brand">⛺ Wildspot</span>
      <button type="button" className="btn btn--map" title="Velg bakgrunnskart" onClick={onOpenBasemaps}>
        🗺️ <span className="basemap-name">{basemapName}</span>
      </button>
      <OverlayMenu selectedIds={overlayIds} onChange={onOverlayIdsChange} />
      <span className="spacer" />
      <span className="muted hide-mobile">{user.username}</span>
      <button type="button" className="btn btn--ghost" onClick={onLogout}>
        Logg ut
      </button>
    </header>
  );
}
