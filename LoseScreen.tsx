import type { RoundResult } from '../App';
import { Button } from '../components/Button';

interface Props {
  result: RoundResult;
  coins: number;
  onRetry: () => void;
  onMenu: () => void;
  onContinue: () => void;
}

export default function LoseScreen({ result, coins, onRetry, onMenu, onContinue }: Props) {
  const cost = 80;
  const canContinue = coins >= cost;

  return (
    <div className="absolute inset-0 flex items-center justify-center px-6"
      style={{ background: 'radial-gradient(ellipse at center, #7f1d1d 0%, #1a0f2e 100%)' }}>
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 pop-in"
        style={{ boxShadow: '0 10px 0 rgba(0,0,0,0.4)' }}>
        <div className="text-center text-6xl mb-2">😵</div>
        <h1 className="text-center text-3xl font-black text-red-600 mb-1"
          style={{ WebkitTextStroke: '1px #fff', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          OUT OF TIME!
        </h1>
        <p className="text-center text-gray-500 text-sm mb-5">{result.score.toLocaleString()} points scored</p>

        <button
          onClick={() => canContinue && onContinue()}
          disabled={!canContinue}
          className="w-full py-3 rounded-2xl font-black text-white text-lg mb-3 btn-3d"
          style={{
            background: canContinue
              ? 'linear-gradient(180deg, #a78bfa, #6d28d9)'
              : 'linear-gradient(180deg, #cbd5e1, #94a3b8)',
            boxShadow: canContinue ? '0 4px 0 #4c1d95' : '0 4px 0 #475569',
            border: 'none',
            opacity: canContinue ? 1 : 0.7,
          }}>
          ⏰ +30s &nbsp;·&nbsp; 🪙 {cost}
        </button>

        <button
          className="w-full py-2.5 rounded-2xl font-black text-white text-base mb-4 btn-3d"
          style={{
            background: 'linear-gradient(180deg, #34d399, #059669)',
            boxShadow: '0 4px 0 #064e3b',
            border: 'none',
          }}>
          📺 Watch Ad for Continue
        </button>

        <div className="flex gap-2">
          <Button onClick={onRetry} variant="secondary" className="flex-1">↺ Retry</Button>
          <Button onClick={onMenu} variant="gold" className="flex-1">🏠 Menu</Button>
        </div>
      </div>
    </div>
  );
}
