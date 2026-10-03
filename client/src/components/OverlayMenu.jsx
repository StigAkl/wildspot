import { groupByCategory, overlays } from '../map/mapLayers.js';

const overlayGroups = groupByCategory(overlays);

export default function OverlayMenu({ selectedIds, onChange }) {
  function toggle(id, isChecked) {
    onChange(isChecked ? [...selectedIds, id] : selectedIds.filter((selectedId) => selectedId !== id));
  }

  return (
    <details className="layers">
      <summary className="btn btn--ghost" title="Stier, stedsnavn, jernbane m.m.">
        Overlegg
      </summary>
      <div className="layers__panel">
        {overlayGroups.map((group) => (
          <fieldset key={group.name}>
            <legend>{group.name}</legend>
            {group.layers.map((overlay) => (
              <label key={overlay.id} title={overlay.description}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(overlay.id)}
                  onChange={(event) => toggle(overlay.id, event.target.checked)}
                />
                {overlay.name}
              </label>
            ))}
          </fieldset>
        ))}
      </div>
    </details>
  );
}
