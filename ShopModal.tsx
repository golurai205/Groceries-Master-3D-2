import type { SaveData } from '../game/store';
import { Button } from '../components/Button';

type BoosterKey = 'undo' | 'shuffle' | 'magnet' | 'freeze';

interface Props {
  save: SaveData;
  onClose: () => void;
  onPurchaseCoins: (amt: number) => void;
  onPurchaseBooster: (k: BoosterKey, amt: number, cost: number) => void;
}

const BOOSTER_PACKS: { key: BoosterKey; label: string; icon: string; amt: number; cost: number }[] = [
  { key: 'undo', label: 'Undo x3', icon: '↩️', amt: 3, cost: 150 },
  { key: 'shuffle', label: 'Shuffle x2', icon: '🔀', amt: 2, cost: 200 },
  { key: 'magnet', label: 'Magnet x2', icon: '🧲', amt: 2, cost: 250 },
  { key: 'freeze', label: 'Freeze x2', icon: '❄️', amt: 2, cost: 200 },
];

const COIN_PACKS = [
  { amt: 500, label: 'Watch Ad', icon: '📺', free: true },
  { amt: 1200, label: '$0.99', icon: '💰' },
  { amt: 3500, label: '$2.99', icon: '💎' },
  { amt: 8000, label: '$4.99', icon: '👑' },
];

export default function ShopModal({ save, onClose, onPurchaseCoins, onPurchaseBooster }: Props) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-3"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 pop-in max-h-[92vh] overflow-y-auto no-scrollbar"
        style={{ boxShadow: '0 8px 0 rgba(0,0,0,0.3)' }}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black text-purple-700">🛒 Shop</h2>
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-full font-black text-amber-700">
            🪙 {save.coins}
          </div>
        </div>

        <h3 className="text-sm font-black text-gray-600 mt-3 mb-2">COIN PACKS</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {COIN_PACKS.map((p, i) => (
            <button key={i}
              onClick={() => onPurchaseCoins(p.amt)}
              className="p-3 rounded-2xl btn-3d flex flex-col items-center"
              style={{
                background: p.free
                  ? 'linear-gradient(180deg, #86efac, #22c55e)'
                  : 'linear-gradient(180deg, #fde047, #f59e0b)',
                boxShadow: p.free ? '0 4px 0 #166534' : '0 4px 0 #92400e',
                border: 'none',
              }}>
              <span className="text-3xl">{p.icon}</span>
              <span className="font-black text-white mt-1">🪙 {p.amt}</span>
              <span className="text-xs font-bold text-white/90">{p.label}</span>
            </button>
          ))}
        </div>

        <h3 className="text-sm font-black text-gray-600 mt-3 mb-2">BOOSTERS</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {BOOSTER_PACKS.map((b, i) => {
            const canBuy = save.coins >= b.cost;
            return (
              <button key={i}
                onClick={() => canBuy && onPurchaseBooster(b.key, b.amt, b.cost)}
                disabled={!canBuy}
                className="p-3 rounded-2xl btn-3d flex flex-col items-center"
                style={{
                  background: canBuy ? 'linear-gradient(180deg, #c4b5fd, #8b5cf6)' : 'linear-gradient(180deg, #cbd5e1, #94a3b8)',
                  boxShadow: canBuy ? '0 4px 0 #4c1d95' : '0 4px 0 #475569',
                  border: 'none',
                  opacity: canBuy ? 1 : 0.6,
                }}>
                <span className="text-3xl">{b.icon}</span>
                <span className="font-black text-white mt-1 text-sm">{b.label}</span>
                <span className="text-xs font-bold text-white/90">🪙 {b.cost}</span>
              </button>
            );
          })}
        </div>

        <Button onClick={onClose} variant="secondary" className="!w-full">Close</Button>
      </div>
    </div>
  );
}
