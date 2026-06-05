import type { SaveData } from '../game/store';
import { Button } from '../components/Button';
import { BRAND } from '../brand';

interface Props {
  save: SaveData;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleRemoveAds: () => void;
  onClose: () => void;
}

export default function SettingsModal({ save, toggleSound, toggleMusic, toggleRemoveAds, onClose }: Props) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 pop-in"
        style={{ boxShadow: '0 8px 0 rgba(0,0,0,0.3)' }}>
        <h2 className="text-center text-2xl font-black text-purple-700 mb-5">Settings</h2>

        <Toggle label="Sound Effects" icon="🔊" on={save.sound} onClick={toggleSound} />
        <Toggle label="Music" icon="🎵" on={save.music} onClick={toggleMusic} />
        <Toggle label="Remove Ads" icon="🚫" on={save.removeAds} onClick={toggleRemoveAds} premium />

        <div className="text-center text-xs text-gray-500 mt-4 mb-3">
          {BRAND.name} v{BRAND.version} — Made with ❤️
        </div>

        <Button onClick={onClose} variant="secondary" className="!w-full">Close</Button>
      </div>
    </div>
  );
}

function Toggle({ label, icon, on, onClick, premium }: { label: string; icon: string; on: boolean; onClick: () => void; premium?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-3 rounded-xl mb-2 bg-gray-100">
      <span className="flex items-center gap-2 font-bold text-gray-700">
        <span className="text-2xl">{icon}</span>
        {label}
        {premium && <span className="text-[10px] bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded font-black">PRO</span>}
      </span>
      <button onClick={onClick}
        className="relative w-14 h-8 rounded-full transition-colors"
        style={{ background: on ? '#22c55e' : '#cbd5e1' }}>
        <div className="absolute top-1 transition-all w-6 h-6 rounded-full bg-white shadow"
          style={{ left: on ? 28 : 4 }} />
      </button>
    </div>
  );
}
