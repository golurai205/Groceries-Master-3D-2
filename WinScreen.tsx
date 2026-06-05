import { useEffect, useState } from 'react';
import type { RoundResult } from '../App';
import { Button } from '../components/Button';
import { sfx } from '../game/audio';

interface Props {
  result: RoundResult;
  level: number;
  isLastLevel?: boolean;
  onNext: () => void;
  onReplay: () => void;
  onMenu: () => void;
}

export default function WinScreen({ result, level, isLastLevel, onNext, onReplay, onMenu }: Props) {
  const [starsShown, setStarsShown] = useState(0);

  useEffect(() => {
    for (let i = 0; i < result.stars; i++) {
      setTimeout(() => { setStarsShown(i + 1); sfx.star(); }, 400 + i * 350);
    }
    setTimeout(() => sfx.coin(), 400 + result.stars * 350 + 200);
  }, [result.stars]);

  const confetti = Array.from({ length: 50 });

  return (
    <div className="absolute inset-0 flex items-center justify-center px-6"
      style={{ background: 'radial-gradient(ellipse at center, #16a34a 0%, #064e3b 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((_, i) => (
          <div key={i}
            className="absolute"
            style={{
              left: `${(i * 7) % 100}%`,
              top: '-5%',
              width: 8 + (i % 5),
              height: 12 + (i % 4),
              background: ['#fde047', '#ec4899', '#3b82f6', '#22d3ee', '#f97316'][i % 5],
              animation: `confetti-fall ${3 + (i % 4) * 0.8}s ${(i % 20) * 0.15}s linear infinite`,
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 pop-in"
        style={{ boxShadow: '0 10px 0 rgba(0,0,0,0.3)' }}>
        <h1 className="text-center text-4xl font-black shimmer-text" style={{ WebkitTextStroke: '1.5px #16a34a' }}>
          LEVEL CLEAR!
        </h1>
        <div className="text-center text-gray-500 font-bold text-sm mt-1">Level {level}</div>

        <div className="flex justify-center gap-2 my-6 h-20 items-center">
          {[0, 1, 2].map((i) => (
            <span key={i} className="text-6xl"
              style={{
                display: 'inline-block',
                opacity: i < starsShown ? 1 : 0.15,
                filter: i < result.stars ? 'drop-shadow(0 0 14px rgba(255,200,0,1))' : 'grayscale(1)',
                animation: i < starsShown ? 'star-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
              }}>
              ⭐
            </span>
          ))}
        </div>

        <div className="space-y-2 mb-5">
          <Row label="Score" value={result.score.toLocaleString()} icon="🏆" />
          <Row label="Combos" value={`${result.combos} (best x${result.maxCombo})`} icon="🔥" />
          <Row label="Time Left" value={`${Math.ceil(result.timeLeft)}s`} icon="⏱️" />
          <Row label="Coins Earned" value={`+${result.coinsEarned}`} icon="🪙" highlight />
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={onNext} variant="primary" size="lg" className="!w-full">
            {isLastLevel ? '🏆 See Finale' : '▶ Next Level'}
          </Button>
          <div className="flex gap-2">
            <Button onClick={onReplay} variant="secondary" className="flex-1">↺ Replay</Button>
            <Button onClick={onMenu} variant="gold" className="flex-1">🏠 Menu</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2 rounded-xl ${highlight ? 'bg-yellow-100' : 'bg-gray-100'}`}>
      <span className="font-bold text-gray-700 flex items-center gap-2"><span>{icon}</span>{label}</span>
      <span className={`font-black ${highlight ? 'text-amber-700 text-lg' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}
