import { useEffect, useState } from 'react';
import Logo from '../components/Logo';

interface Props {
  level: number;
  continued?: boolean;
  onDone: () => void;
}

const TIPS = [
  'Tap grocery items to send them to the tray.',
  'Match 3 of a kind to clear the basket.',
  'Top items must be cleared first!',
  'Chain combos for huge score bonuses.',
  'Shuffle if you get stuck — it always helps.',
  'Beat the clock for a 3-star Grocery Master rating!',
  'Magnet auto-collects a matching trio.',
  'Freeze gives you 10s of extra breathing room.',
];

export default function LoadingScreen({ level, onDone }: Props) {
  const [p, setP] = useState(0);
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / dur);
      setP(t);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTimeout(onDone, 150);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8"
      style={{
        background: 'radial-gradient(ellipse at center, #ff8c42 0%, #c2185b 60%, #4a148c 100%)',
      }}>
      <div className="mb-8 opacity-95">
        <Logo size={0.85} />
      </div>

      <div className="text-white font-black text-2xl mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
        Level {level}
      </div>

      <div className="w-full max-w-xs">
        <div className="h-5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${p * 100}%`,
              background: 'linear-gradient(90deg, #fde047, #f59e0b, #ec4899)',
              boxShadow: '0 0 10px rgba(255,200,0,0.7)',
            }}
          />
        </div>
        <div className="mt-2 text-center text-white/80 font-bold text-xs">{Math.round(p * 100)}%</div>
      </div>

      <div className="mt-10 max-w-xs text-center text-white/85 text-sm italic">
        💡 {tip}
      </div>
    </div>
  );
}
