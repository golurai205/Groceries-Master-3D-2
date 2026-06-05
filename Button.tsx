import { sfx } from '../game/audio';

interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'gold';
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ children, onClick, variant = 'primary', className = '', disabled, size = 'md' }: BtnProps) {
  const styles: Record<string, { bg: string; shadow: string; text: string }> = {
    primary: { bg: 'linear-gradient(180deg, #4ade80, #16a34a)', shadow: '#14532d', text: '#fff' },
    secondary: { bg: 'linear-gradient(180deg, #60a5fa, #2563eb)', shadow: '#1e3a8a', text: '#fff' },
    danger: { bg: 'linear-gradient(180deg, #fb7185, #e11d48)', shadow: '#881337', text: '#fff' },
    gold: { bg: 'linear-gradient(180deg, #fde047, #f59e0b)', shadow: '#78350f', text: '#4a2700' },
  };
  const s = styles[variant];
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-xl',
  };
  return (
    <button
      disabled={disabled}
      onClick={() => { if (disabled) return; sfx.click(); onClick?.(); }}
      className={`btn-3d font-black rounded-2xl ${sizes[size]} ${className}`}
      style={{
        background: s.bg,
        color: s.text,
        boxShadow: `0 5px 0 ${s.shadow}, 0 8px 16px rgba(0,0,0,0.25)`,
        WebkitTextStroke: '1px rgba(0,0,0,0.15)',
        textShadow: '0 1px 0 rgba(255,255,255,0.3)',
        opacity: disabled ? 0.55 : 1,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, active = true, className = '' }: { children: React.ReactNode; onClick?: () => void; active?: boolean; className?: string }) {
  return (
    <button
      onClick={() => { sfx.click(); onClick?.(); }}
      className={`btn-3d flex items-center justify-center rounded-full ${className}`}
      style={{
        width: 52,
        height: 52,
        background: active ? 'linear-gradient(180deg, #fef3c7, #fbbf24)' : 'linear-gradient(180deg, #cbd5e1, #64748b)',
        boxShadow: `0 4px 0 ${active ? '#92400e' : '#334155'}, 0 6px 10px rgba(0,0,0,0.2)`,
        border: 'none',
      }}
    >
      {children}
    </button>
  );
}
