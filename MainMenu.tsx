import Logo from '../components/Logo';
import { Button, IconButton } from '../components/Button';
import type { SaveData } from '../game/store';
import { BRAND } from '../brand';

interface Props {
  save: SaveData;
  onPlay: () => void;
  onSettings: () => void;
  onShop: () => void;
  onDaily: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
}

export default function MainMenu({ save, onPlay, onSettings, onShop, onDaily, toggleSound, toggleMusic }: Props) {
  const emojis = ['🍎', '🍌', '🥛', '🍞', '🧀', '🍩', '🧃', '🥕', '🥚'];
  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Floating emoji background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {emojis.map((e, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-20 bounce-soft"
            style={{
              left: `${(i * 37) % 90 + 5}%`,
              top: `${(i * 53) % 80 + 5}%`,
              animationDelay: `${i * 0.3}s`,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            }}
          >
            {e}
          </div>
        ))}
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex justify-between items-center p-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
          <span className="text-2xl">🪙</span>
          <span className="text-white font-black text-lg" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            {save.coins.toLocaleString()}
          </span>
          <button onClick={onShop} className="ml-1 text-white text-xl bg-green-500 rounded-full w-7 h-7 flex items-center justify-center font-black btn-3d"
            style={{ boxShadow: '0 2px 0 #14532d' }}>+</button>
        </div>

        <button
          onClick={onDaily}
          className="px-3 py-1.5 rounded-xl text-white font-black text-sm btn-3d glow-pulse"
          style={{
            background: 'linear-gradient(180deg, #f43f5e, #be123c)',
            boxShadow: '0 3px 0 #881337',
          }}>
          🎁 Daily
        </button>
      </div>

      {/* Logo area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <Logo />
        <div className="mt-4 text-white/90 font-bold text-center text-base"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          {BRAND.tagline}
        </div>

        {/* Play button */}
        <div className="mt-10">
          <Button onClick={onPlay} variant="primary" size="lg" className="!text-2xl !px-12 !py-4">
            ▶ PLAY
          </Button>
        </div>

        {/* Level indicator */}
        <div className="mt-4 px-5 py-1.5 rounded-full bg-black/30 text-white font-bold text-sm">
          Level {save.level}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 flex justify-center gap-3 p-6">
        <IconButton onClick={toggleSound} active={save.sound}>
          <span className="text-2xl">{save.sound ? '🔊' : '🔇'}</span>
        </IconButton>
        <IconButton onClick={toggleMusic} active={save.music}>
          <span className="text-2xl">{save.music ? '🎵' : '🎶'}</span>
        </IconButton>
        <IconButton onClick={onSettings}>
          <span className="text-2xl">⚙️</span>
        </IconButton>
        <IconButton onClick={onShop}>
          <span className="text-2xl">🛒</span>
        </IconButton>
      </div>
    </div>
  );
}
