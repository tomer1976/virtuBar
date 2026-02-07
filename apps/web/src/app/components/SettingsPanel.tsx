import { Drawer } from '../../ui/components';
import { useSettings } from '../providers/SettingsProvider';

type SettingsPanelProps = {
  open: boolean;
  onClose: () => void;
};

function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <Drawer open={open} onClose={onClose} title="Settings">
      <div style={{ display: 'grid', gap: '12px' }}>
        <label htmlFor="audio-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            id="audio-muted"
            type="checkbox"
            checked={settings.audioMuted}
            onChange={(e) => updateSettings({ audioMuted: e.target.checked })}
          />
          Mute audio (mock)
        </label>

        <label htmlFor="motion-reduction" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            id="motion-reduction"
            type="checkbox"
            checked={settings.motionReduction}
            onChange={(e) => updateSettings({ motionReduction: e.target.checked })}
          />
          Reduce motion
        </label>

        <fieldset style={{ border: '1px solid var(--color-border)', borderRadius: '10px', padding: '10px' }}>
          <legend style={{ padding: '0 6px' }}>Graphics quality</legend>
          {(['low', 'medium', 'high'] as const).map((quality) => (
            <label
              key={quality}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}
              htmlFor={`graphics-${quality}`}
            >
              <input
                id={`graphics-${quality}`}
                type="radio"
                name="graphicsQuality"
                value={quality}
                checked={settings.graphicsQuality === quality}
                onChange={() => updateSettings({ graphicsQuality: quality })}
              />
              {quality.charAt(0).toUpperCase() + quality.slice(1)}
            </label>
          ))}
        </fieldset>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" type="button" onClick={resetSettings}>
            Reset
          </button>
          <button className="btn btn-primary" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </Drawer>
  );
}

export default SettingsPanel;
