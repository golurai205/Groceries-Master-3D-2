import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { PileScene } from '../game/Scene';
import { generateLevel, getLevelConfig, computeFreeMap, resetIds, type PileItem } from '../game/level';
import { ITEM_META, type ItemType } from '../game/items';
import { sfx } from '../game/audio';
import type { SaveData } from '../game/store';
import type { RoundResult } from '../App';

interface Props {
  level: number;
  boosters: SaveData['boosters'];
  updateBoosters: (b: Partial<SaveData['boosters']>) => void;
  coins: number;
  updateCoins: (delta: number) => void;
  onWin: (r: RoundResult) => void;
  onLose: (r: RoundResult) => void;
  onQuit: () => void;
}

interface TraySlot {
  id: number;
  type: ItemType;
}

interface FloatText {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
}

let floatId = 1;

export default function GameScreen({
  level, boosters, updateBoosters, coins, updateCoins, onWin, onLose, onQuit,
}: Props) {
  const cfg = useMemo(() => getLevelConfig(level), [level]);
  const [items, setItems] = useState<PileItem[]>(() => { resetIds(); return generateLevel(cfg); });
  const [tray, setTray] = useState<TraySlot[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(cfg.time);
  const [paused, setPaused] = useState(false);
  const [floats, setFloats] = useState<FloatText[]>([]);
  const [history, setHistory] = useState<Array<{ item: PileItem; slot: TraySlot }>>([]);
  const [freezeRemaining, setFreezeRemaining] = useState(0);
  const [showPause, setShowPause] = useState(false);
  // "stopped" halts the countdown immediately the moment the level is won/lost.
  // Once true it stays true for the lifetime of this GameScreen instance
  // (every new level remounts the component via key={lvl-X-Y} in App.tsx).
  const [stopped, setStopped] = useState(false);
  const finishedRef = useRef(false);
  const comboTimeoutRef = useRef<number | null>(null);

  const freeMap = useMemo(() => computeFreeMap(items), [items]);

  const totalTime = cfg.time;

  // Timer (uses ref for stable callback access)
  const stateRef = useRef({ score: 0, comboCount: 0, maxCombo: 0, freezeRemaining: 0 });
  useEffect(() => {
    stateRef.current = { score, comboCount, maxCombo, freezeRemaining };
  });
  useEffect(() => {
    // Do not run while paused, after the level has ended, or after stop request.
    if (paused || stopped || finishedRef.current) return;
    const interval = window.setInterval(() => {
      // Guard inside the tick as well in case stop happened mid-interval.
      if (stopped || finishedRef.current) return;
      setFreezeRemaining((f) => Math.max(0, f - 0.1));
      setTimeLeft((t) => {
        if (stateRef.current.freezeRemaining > 0.05) return t;
        const nt = Math.max(0, t - 0.1);
        if (nt <= 0 && !finishedRef.current) {
          finishedRef.current = true;
          setStopped(true);
          sfx.lose();
          const s = stateRef.current;
          setTimeout(() => onLose({
            stars: 0, score: s.score, coinsEarned: 0, combos: s.comboCount, maxCombo: s.maxCombo, timeLeft: 0, totalTime,
          }), 100);
        }
        return nt;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [paused, stopped, totalTime, onLose]);

  const addFloat = useCallback((text: string, color: string) => {
    const id = floatId++;
    setFloats((arr) => [...arr, { id, text, color, x: 50 + (Math.random() - 0.5) * 20, y: 50 }]);
    setTimeout(() => setFloats((arr) => arr.filter((f) => f.id !== id)), 1200);
  }, []);

  const resetComboTimer = useCallback(() => {
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = window.setTimeout(() => setCombo(0), 2500);
  }, []);

  const processMatches = useCallback((currentTray: TraySlot[]) => {
    // Find first triple
    const counts: Record<string, TraySlot[]> = {};
    currentTray.forEach((s) => {
      counts[s.type] = counts[s.type] || [];
      counts[s.type].push(s);
    });
    for (const type of Object.keys(counts)) {
      if (counts[type].length >= 3) {
        const matched = counts[type].slice(0, 3);
        const matchedIds = new Set(matched.map((m) => m.id));
        // animation: scale + particle done via CSS on slot id
        setTimeout(() => {
          setTray((tr) => tr.filter((s) => !matchedIds.has(s.id)));
        }, 220);

        // Combo
        setCombo((c) => {
          const nc = c + 1;
          setMaxCombo((m) => Math.max(m, nc));
          setComboCount((cc) => cc + 1);
          const base = 100;
          const points = nc === 1 ? base : nc === 2 ? 250 : nc === 3 ? 500 : 500 + (nc - 3) * 250;
          setScore((p) => p + points);
          addFloat(`+${points}${nc > 1 ? ` x${nc}` : ''}`, nc > 1 ? '#ffd93d' : '#ffffff');
          if (nc >= 2) {
            sfx.combo(nc);
            addFloat(`COMBO x${nc}!`, '#f472b6');
            updateCoins(5 * nc);
          } else {
            sfx.match();
          }
          resetComboTimer();
          return nc;
        });

        return matchedIds;
      }
    }
    return null;
  }, [addFloat, resetComboTimer, updateCoins]);

  const tapItem = useCallback((id: number) => {
    if (finishedRef.current || paused) return;
    if (tray.length >= 7) return;
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (!freeMap[id]) return;

    sfx.pickup();

    // Animate removal from board
    setRemovingIds((s) => { const n = new Set(s); n.add(id); return n; });
    setTimeout(() => {
      setItems((arr) => arr.filter((x) => x.id !== id));
      setRemovingIds((s) => { const n = new Set(s); n.delete(id); return n; });
    }, 400);

    const slot: TraySlot = { id: item.id, type: item.type };
    setTray((tr) => {
      // Smart insert: group same types together for nicer visual
      const newTray: TraySlot[] = [];
      let inserted = false;
      for (const s of tr) {
        newTray.push(s);
        if (!inserted && s.type === slot.type) {
          // insert right after last same-type
        }
      }
      // Simpler: insert after last same-type slot
      const lastSame = tr.map((s) => s.type).lastIndexOf(slot.type);
      const final = [...tr];
      if (lastSame >= 0) final.splice(lastSame + 1, 0, slot);
      else final.push(slot);

      setHistory((h) => [...h, { item, slot }]);

      // Schedule match check
      setTimeout(() => {
        setTray((cur) => {
          const matched = processMatches(cur);
          if (!matched) {
            // No match — break combo timer if no match happens
            if (cur.length >= 7) {
              // Lose
              if (!finishedRef.current) {
                finishedRef.current = true;
                setStopped(true);                    // halt timer immediately
                sfx.lose();
                setTimeout(() => onLose({
                  stars: 0, score, coinsEarned: 0, combos: comboCount, maxCombo,
                  timeLeft, totalTime,
                }), 250);
              }
            } else if (cur.length >= 6) {
              sfx.danger();
            } else if (cur.length >= 5) {
              sfx.warn();
            }
            return cur;
          }
          return cur;
        });
      }, 250);

      return final;
    });
  }, [items, freeMap, tray, paused, processMatches, score, comboCount, maxCombo, timeLeft, totalTime, onLose]);

  // Detect win: pile cleared (board items === 0 AND tray empty).
  // The timer is stopped THE INSTANT the board hits zero so the time
  // shown on the Win screen is exactly the time at the moment of victory.
  const frozenTimeRef = useRef<number | null>(null);
  useEffect(() => {
    if (finishedRef.current) return;
    if (items.length !== 0) return;
    // Stop the clock immediately on board-clear, before the post-animation grace period.
    if (frozenTimeRef.current === null) {
      frozenTimeRef.current = timeLeft;
      setStopped(true);
    }
    // Small delay to allow any in-flight match animation to clear the tray.
    const t = window.setTimeout(() => {
      if (finishedRef.current) return;
      if (items.length === 0 && tray.length === 0 && removingIds.size === 0) {
        finishedRef.current = true;
        const finalTime = frozenTimeRef.current ?? timeLeft;
        const ratio = finalTime / totalTime;
        const stars = ratio > 0.5 ? 3 : ratio > 0.2 ? 2 : 1;
        const coinsEarned = 50 + stars * 30 + comboCount * 5;
        sfx.win();
        setTimeout(() => onWin({
          stars, score, coinsEarned, combos: comboCount, maxCombo, timeLeft: finalTime, totalTime,
        }), 500);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [items, tray, removingIds, timeLeft, totalTime, score, comboCount, maxCombo, onWin]);

  // -------- Boosters --------
  const useUndo = () => {
    if (boosters.undo <= 0 || history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setTray((tr) => tr.filter((s) => s.id !== last.slot.id));
    setItems((arr) => [...arr, last.item]);
    updateBoosters({ undo: boosters.undo - 1 });
    sfx.click();
  };

  const useShuffle = () => {
    if (boosters.shuffle <= 0) return;
    sfx.shuffle();
    setItems((arr) => {
      // shuffle types, keep positions
      const types = arr.map((a) => a.type);
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }
      return arr.map((a, i) => ({ ...a, type: types[i] }));
    });
    updateBoosters({ shuffle: boosters.shuffle - 1 });
  };

  const useMagnet = () => {
    if (boosters.magnet <= 0) return;
    // Find a type with at least 3 free instances
    const counts: Record<string, PileItem[]> = {};
    for (const it of items) {
      if (freeMap[it.id]) {
        counts[it.type] = counts[it.type] || [];
        counts[it.type].push(it);
      }
    }
    // Also consider items in tray
    const trayCount: Record<string, number> = {};
    tray.forEach((s) => { trayCount[s.type] = (trayCount[s.type] || 0) + 1; });
    let chosen: ItemType | null = null;
    for (const t of Object.keys(counts)) {
      const have = trayCount[t] || 0;
      const need = 3 - have;
      if (counts[t].length >= need) { chosen = t as ItemType; break; }
    }
    if (!chosen) {
      // fallback: any type with 3 free items
      for (const t of Object.keys(counts)) if (counts[t].length >= 3) { chosen = t as ItemType; break; }
    }
    if (!chosen) return;
    sfx.combo(3);
    updateBoosters({ magnet: boosters.magnet - 1 });
    const haveInTray = trayCount[chosen] || 0;
    const needToTap = Math.max(0, 3 - haveInTray);
    const targets = counts[chosen].slice(0, needToTap);
    targets.forEach((t, i) => setTimeout(() => tapItem(t.id), i * 150));
  };

  const useFreeze = () => {
    if (boosters.freeze <= 0) return;
    setFreezeRemaining((f) => f + 10);
    updateBoosters({ freeze: boosters.freeze - 1 });
    sfx.freeze();
    addFloat('⏸ FREEZE 10s', '#7dd3fc');
  };

  // ------- HUD calculations -------
  const timePct = (timeLeft / totalTime) * 100;
  const timeLow = timePct < 25;
  const trayWarn = tray.length === 5;
  const trayDanger = tray.length >= 6;
  const remaining = items.length;

  return (
    <div className="absolute inset-0 flex flex-col"
      style={{
        background:
          'radial-gradient(ellipse at top, #ffd699 0%, #ff9a56 40%, #c2185b 100%)',
      }}>
      {/* Top HUD */}
      <div className="relative z-20 px-3 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => { setPaused(true); setShowPause(true); sfx.click(); }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-black btn-3d"
            style={{ background: 'linear-gradient(180deg, #475569, #1e293b)', boxShadow: '0 3px 0 #0f172a' }}>
            ⏸
          </button>

          <div className="flex-1 mx-2">
            <div className="flex justify-between text-xs text-white/90 font-bold mb-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
              <span>LEVEL {level}</span>
              <span>{Math.ceil(timeLeft)}s {freezeRemaining > 0 && '❄️'}</span>
            </div>
            <div className={`h-4 rounded-full overflow-hidden ${timeLow ? 'danger-glow' : ''}`}
              style={{ background: 'rgba(0,0,0,0.4)', boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.4)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${timePct}%`,
                  background: freezeRemaining > 0
                    ? 'linear-gradient(90deg, #7dd3fc, #38bdf8)'
                    : timeLow
                      ? 'linear-gradient(90deg, #fca5a5, #ef4444)'
                      : 'linear-gradient(90deg, #86efac, #22c55e, #fde047)',
                  boxShadow: '0 0 8px rgba(255,255,255,0.5)',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="px-2.5 py-1 rounded-full text-white font-black text-xs flex items-center gap-1"
              style={{ background: 'rgba(0,0,0,0.4)' }}>
              🪙 {coins}
            </div>
          </div>
        </div>

        {/* Score + remaining + stars */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="px-3 py-1 rounded-xl text-white font-black flex items-center gap-1"
            style={{ background: 'rgba(0,0,0,0.35)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
            <span className="text-xs opacity-80">SCORE</span>
            <span className="text-base">{score.toLocaleString()}</span>
          </div>
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => {
              const ratio = timeLeft / totalTime;
              const earned = (i === 0 && ratio > 0.2) || (i === 1 && ratio > 0.2) || (i === 2 && ratio > 0.5);
              const partial = (i === 0 && ratio > 0) || (i === 1 && ratio > 0.2);
              const active = (i === 2 && ratio > 0.5) || (i === 1 && ratio > 0.2) || (i === 0 && ratio > 0);
              return (
                <span key={i} className="text-xl" style={{
                  filter: active ? 'drop-shadow(0 0 6px rgba(255,220,0,0.9))' : 'grayscale(1) opacity(0.4)',
                  transform: earned || partial ? 'scale(1)' : 'scale(0.9)',
                  transition: 'all 0.3s',
                }}>⭐</span>
              );
            })}
          </div>
          <div className="px-3 py-1 rounded-xl text-white font-black text-sm"
            style={{ background: 'rgba(0,0,0,0.35)' }}>
            📦 {remaining}
          </div>
        </div>

        {combo >= 2 && (
          <div className="absolute left-1/2 -translate-x-1/2 top-20 px-4 py-1 rounded-full font-black text-white text-lg pop-in"
            style={{
              background: 'linear-gradient(90deg, #ec4899, #f59e0b)',
              boxShadow: '0 4px 15px rgba(236,72,153,0.6)',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>
            🔥 COMBO x{combo}
          </div>
        )}
      </div>

      {/* 3D Canvas */}
      <div className="relative flex-1">
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 7, 7], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
        >
          <PileScene items={items} freeMap={freeMap} removingIds={removingIds} onTap={tapItem} />
        </Canvas>

        {/* floating texts */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floats.map((f) => (
            <div
              key={f.id}
              className="absolute font-black text-2xl float-up"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                color: f.color,
                textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 12px rgba(0,0,0,0.3)',
                WebkitTextStroke: '1.5px rgba(0,0,0,0.4)',
              }}
            >
              {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Boosters */}
      <div className="relative z-20 px-3 py-2 flex justify-center gap-2">
        <BoosterBtn icon="↩️" label="Undo" count={boosters.undo} onClick={useUndo} />
        <BoosterBtn icon="🔀" label="Shuffle" count={boosters.shuffle} onClick={useShuffle} />
        <BoosterBtn icon="🧲" label="Magnet" count={boosters.magnet} onClick={useMagnet} />
        <BoosterBtn icon="❄️" label="Freeze" count={boosters.freeze} onClick={useFreeze} />
      </div>

      {/* Tray */}
      <div className="relative z-20 mx-3 mb-4 p-3 rounded-3xl"
        style={{
          background: trayDanger
            ? 'linear-gradient(180deg, #fee2e2, #fecaca)'
            : trayWarn
              ? 'linear-gradient(180deg, #fef3c7, #fde68a)'
              : 'linear-gradient(180deg, #ede9fe, #ddd6fe)',
          boxShadow: '0 6px 0 rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.5)',
          border: trayDanger ? '3px solid #ef4444' : trayWarn ? '3px solid #f59e0b' : '3px solid #8b5cf6',
        }}>
        <div className={`grid grid-cols-7 gap-1 ${trayDanger ? 'danger-glow' : trayWarn ? 'warn-glow' : ''}`}
          style={{ borderRadius: 12, padding: 2 }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const slot = tray[i];
            return (
              <div key={i} className="aspect-square rounded-xl flex items-center justify-center pop-in"
                style={{
                  background: slot
                    ? `linear-gradient(180deg, ${ITEM_META[slot.type].color}55, ${ITEM_META[slot.type].color}aa)`
                    : 'rgba(255,255,255,0.4)',
                  boxShadow: slot
                    ? `0 3px 0 ${ITEM_META[slot.type].color}, inset 0 1px 3px rgba(255,255,255,0.6)`
                    : 'inset 0 2px 4px rgba(0,0,0,0.15)',
                  border: '2px solid rgba(255,255,255,0.5)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {slot && (
                  <span className="text-3xl pop-in" style={{
                    filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.4))',
                  }}>
                    {ITEM_META[slot.type].emoji}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showPause && (
        <div className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-3xl p-6 w-72 text-center"
            style={{ boxShadow: '0 8px 0 rgba(0,0,0,0.3)' }}>
            <h2 className="text-2xl font-black text-purple-700 mb-4">Paused</h2>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setPaused(false); setShowPause(false); sfx.click(); }}
                className="py-2.5 rounded-2xl font-black text-white text-lg btn-3d"
                style={{ background: 'linear-gradient(180deg, #4ade80, #16a34a)', boxShadow: '0 4px 0 #14532d' }}>
                ▶ Resume
              </button>
              <button onClick={() => { sfx.click(); onQuit(); }}
                className="py-2.5 rounded-2xl font-black text-white text-lg btn-3d"
                style={{ background: 'linear-gradient(180deg, #fb7185, #e11d48)', boxShadow: '0 4px 0 #881337' }}>
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BoosterBtn({ icon, label, count, onClick }: { icon: string; label: string; count: number; onClick: () => void }) {
  const disabled = count <= 0;
  return (
    <button
      onClick={() => { if (!disabled) { sfx.click(); onClick(); } }}
      disabled={disabled}
      className="relative flex flex-col items-center justify-center rounded-2xl btn-3d"
      style={{
        width: 64, height: 64,
        background: disabled
          ? 'linear-gradient(180deg, #cbd5e1, #94a3b8)'
          : 'linear-gradient(180deg, #fde047, #f59e0b)',
        boxShadow: disabled
          ? '0 3px 0 #475569'
          : '0 4px 0 #78350f, 0 6px 10px rgba(0,0,0,0.2)',
        border: 'none',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] font-black text-amber-900 mt-0.5">{label}</span>
      <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center border-2 border-white">
        {count}
      </span>
    </button>
  );
}
