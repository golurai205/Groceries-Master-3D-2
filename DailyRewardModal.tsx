import type { SaveData } from '../game/store';
import { Button } from '../components/Button';

export type BoosterKey = 'undo' | 'shuffle' | 'magnet' | 'freeze';

export interface Reward {
  coins?: number;
  booster?: BoosterKey;
  amount?: number;
  label: string;
  icon: string;
  premium?: boolean;
}

export const DAILY_REWARDS: Reward[] = [
  { label: '100 Coins', icon: '🪙', coins: 100 },
  { label: 'Shuffle x1', icon: '🔀', booster: 'shuffle', amount: 1 },
  { label: 'Magnet x1', icon: '🧲', booster: 'magnet', amount: 1 },
  { label: '200 Coins', icon: '🪙', coins: 200 },
  { label: 'Freeze x1', icon: '❄️', booster: 'freeze', amount: 1 },
  { label: 'Premium', icon: '💎', coins: 350, premium: true },
  { label: 'MEGA CHEST', icon: '🎁', coins: 500, booster: 'magnet', amount: 2, premium: true },
];

interface Props {
  save: SaveData;
  onClaim: (r: Reward) => void;
  onClose: () => void;
}

export default function DailyRewardModal({ save, onClaim, onClose }: Props) {
  const today = save.dailyDay;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 pop-in"
        style={{ boxShadow: '0 8px 0 rgba(0,0,0,0.3)' }}>
        <h2 className="text-center text-2xl font-black text-purple-700 mb-1">Daily Rewards</h2>
        <p className="text-center text-gray-500 text-xs mb-4">Come back every day to earn more!</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {DAILY_REWARDS.map((r, i) => {
            const day = i + 1;
            const claimed = day < today;
            const isToday = day === today;
            const mega = !!r.premium;
            return (
              <div key={i}
                className={`rounded-2xl p-2 flex flex-col items-center justify-center text-center relative ${isToday ? 'glow-pulse' : ''}`}
                style={{
                  background: claimed
                    ? 'linear-gradient(180deg, #d1fae5, #a7f3d0)'
                    : isToday
                      ? mega ? 'linear-gradient(180deg, #fde047, #f59e0b)' : 'linear-gradient(180deg, #c4b5fd, #8b5cf6)'
                      : mega ? 'linear-gradient(180deg, #fef3c7, #fde68a)' : 'linear-gradient(180deg, #f3f4f6, #e5e7eb)',
                  border: isToday ? '2px solid #ec4899' : '2px solid transparent',
                  minHeight: 90,
                  gridColumn: i === 6 ? 'span 3' : 'auto',
                }}>
                <div className="text-[10px] font-black text-gray-700">DAY {day}</div>
                <div className="text-3xl my-1">{r.icon}</div>
                <div className={`text-[10px] font-black ${isToday && !mega ? 'text-white' : 'text-gray-800'}`}>
                  {r.label}
                </div>
                {claimed && (
                  <div className="absolute inset-0 flex items-center justify-center text-3xl">✓</div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onClaim(DAILY_REWARDS[today - 1])} variant="primary" className="flex-1">
            🎁 Claim Day {today}
          </Button>
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
      </div>
    </div>
  );
}
