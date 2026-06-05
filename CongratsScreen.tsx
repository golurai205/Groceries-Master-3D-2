import { useEffect } from 'react';
import { Button } from '../components/Button';
import Logo from '../components/Logo';
import { sfx } from '../game/audio';
import { MAX_LEVEL } from '../game/level';

interface Props {
  totalStars: number;
  onReplay: () => void;
  onMenu: () => void;
}

export default function CongratsScreen({ totalStars, onReplay, onMenu }: Props) {
  useEffect(() => {
    sfx.win();
    [0, 1, 2, 3].forEach((i) => setTimeout(() => sfx.star(), 400 + i * 250));
  }, []);

  const confetti = Array.from({ length: 80 });

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6"
      style={{
        background:
          'radial-gradient(ellipse at center, #fde047 0%, #f59e0b 35%, #c2185b 75%, #4a148c 100%)',
      }}>
      {/* confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((_, i) => (
          <div key={i}
            className="absolute"
            style={{
              left: `${(i * 13) % 100}%`,
              top: '-5%',
              width: 8 + (i % 5),
              height: 12 + (i % 4),
              background: ['#fde047', '#ec4899', '#3b82f6', '#22d3ee', '#f97316', '#a855f7'][i % 6],
              animation: `confetti-fall ${3 + (i % 4) * 0.8}s ${(i % 25) * 0.12}s linear infinite`,
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 pop-in text-center"
        style={{ boxShadow: '0 10px 0 rgba(0,0,0,0.3)' }}>
        <div className="text-7xl mb-2 glow-pulse">🏆</div>
        <h1 className="text-3xl font-black shimmer-text mb-1" style={{ WebkitTextStroke: '1.5px #c2185b' }}>
          CONGRATULATIONS!
        </h1>
        <p className="text-gray-600 font-bold text-sm mb-4">
          You've mastered all {MAX_LEVEL} levels!
        </p>

        <div className="my-5">
          <Logo size={0.6} />
        </div>

        <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-4 mb-5">
          <div className="text-xs font-black text-amber-700">TOTAL STARS EARNED</div>
          <div className="text-4xl font-black text-amber-600 mt-1 flex items-center justify-center gap-1">
            <span style={{ filter: 'drop-shadow(0 0 10px rgba(255,200,0,0.9))' }}>⭐</span>
            {totalStars} / {MAX_LEVEL * 3}
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          You're a true Grocery Master! Replay any level to earn more stars.
        </p>

        <div className="flex flex-col gap-2">
          <Button onClick={onReplay} variant="primary" size="lg" className="!w-full">
            ↺ Play Again
          </Button>
          <Button onClick={onMenu} variant="gold" className="!w-full">🏠 Main Menu</Button>
        </div>
      </div>
    </div>
  );
}
