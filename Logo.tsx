/**
 * Grocery Master 3D — game wordmark logo.
 *
 * Style: colorful casual puzzle-game lettering with a chunky 3D drop shadow,
 * decorated with grocery icons (🍎 🍌 🥛 🍞 🧀 🍩 🥕 🧃) to reinforce
 * the grocery-matching gameplay theme.
 */
export default function Logo({ size = 1, showDecor = true }: { size?: number; showDecor?: boolean }) {
  return (
    <div className="relative inline-flex flex-col items-center" style={{ transform: `scale(${size})` }}>
      {/* Soft warm glow halo behind the wordmark */}
      <div
        className="absolute -inset-6 blur-3xl opacity-70 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, #fff3a8 0%, #ffb84d 35%, transparent 70%)',
        }}
      />

      {/* Floating grocery decorations around the logo */}
      {showDecor && (
        <>
          <Decor emoji="🍎" style={{ top: -22, left: -28, transform: 'rotate(-18deg)' }} />
          <Decor emoji="🍌" style={{ top: -16, right: -32, transform: 'rotate(20deg)' }} />
          <Decor emoji="🥛" style={{ top: 18, left: -42, transform: 'rotate(-8deg)' }} delay={0.4} />
          <Decor emoji="🧃" style={{ top: 28, right: -40, transform: 'rotate(10deg)' }} delay={0.7} />
          <Decor emoji="🍞" style={{ bottom: -8, left: -34, transform: 'rotate(-14deg)' }} delay={0.2} />
          <Decor emoji="🥕" style={{ bottom: -14, right: -28, transform: 'rotate(16deg)' }} delay={0.9} />
          <Decor emoji="🧀" style={{ bottom: -32, left: '40%', transform: 'translateX(-50%) rotate(-6deg)' }} delay={1.1} />
          <Decor emoji="🍩" style={{ top: -32, left: '46%', transform: 'translateX(-50%) rotate(8deg)' }} delay={0.5} />
        </>
      )}

      {/* Word 1: GROCERY — fresh green gradient (leafy / produce vibe) */}
      <div className="relative flex items-center justify-center -mb-1">
        {['G', 'R', 'O', 'C', 'E', 'R', 'Y'].map((c, i, arr) => (
          <span
            key={i}
            className="inline-block font-black"
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: '2.65rem',
              lineHeight: 1,
              background: 'linear-gradient(180deg, #b9f5a3 0%, #4ade80 45%, #16a34a 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextStroke: '2.5px #14532d',
              filter: 'drop-shadow(0 4px 0 #14532d) drop-shadow(0 7px 8px rgba(0,0,0,0.35))',
              transform: `rotate(${(i - (arr.length - 1) / 2) * 3.2}deg) translateY(${Math.abs(i - (arr.length - 1) / 2) * 1.5}px)`,
              margin: '0 -1px',
              padding: '0 1px',
            }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* Word 2: MASTER — warm cheese/honey gradient */}
      <div className="relative flex items-center justify-center">
        {['M', 'A', 'S', 'T', 'E', 'R'].map((c, i, arr) => (
          <span
            key={i}
            className="inline-block font-black"
            style={{
              fontFamily: 'Nunito, system-ui, sans-serif',
              fontSize: '2.4rem',
              lineHeight: 1,
              background: 'linear-gradient(180deg, #fff3a8 0%, #fde047 40%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextStroke: '2.5px #7c2d12',
              filter: 'drop-shadow(0 4px 0 #7c2d12) drop-shadow(0 7px 8px rgba(0,0,0,0.35))',
              transform: `rotate(${(i - (arr.length - 1) / 2) * 2.8}deg)`,
              margin: '0 -1px',
              padding: '0 1px',
            }}
          >
            {c}
          </span>
        ))}
      </div>

      {/* 3D badge — pink/red ribbon */}
      <div
        className="relative mt-2 px-5 py-1 rounded-xl font-black text-center"
        style={{
          fontFamily: 'Nunito, system-ui, sans-serif',
          fontSize: '1.55rem',
          background: 'linear-gradient(180deg, #ff7eb6 0%, #ec4899 45%, #be185d 100%)',
          color: '#fff',
          WebkitTextStroke: '1.5px #831843',
          textShadow: '0 2px 0 #831843, 0 3px 6px rgba(0,0,0,0.4)',
          boxShadow:
            '0 4px 0 #831843, 0 7px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5)',
          border: '2px solid rgba(255,255,255,0.6)',
          letterSpacing: '0.05em',
        }}
      >
        3D
      </div>
    </div>
  );
}

function Decor({
  emoji,
  style,
  delay = 0,
}: {
  emoji: string;
  style: React.CSSProperties;
  delay?: number;
}) {
  return (
    <span
      className="absolute pointer-events-none bounce-soft"
      style={{
        fontSize: '1.6rem',
        filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.45))',
        animationDelay: `${delay}s`,
        ...style,
      }}
    >
      {emoji}
    </span>
  );
}
