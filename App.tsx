import { useEffect, useState, useCallback, useRef } from 'react';
import MainMenu from './screens/MainMenu';
import LoadingScreen from './screens/LoadingScreen';
import GameScreen from './screens/GameScreen';
import WinScreen from './screens/WinScreen';
import LoseScreen from './screens/LoseScreen';
import CongratsScreen from './screens/CongratsScreen';
import DailyRewardModal from './screens/DailyRewardModal';
import SettingsModal from './screens/SettingsModal';
import ShopModal from './screens/ShopModal';
import type { Reward, BoosterKey } from './screens/DailyRewardModal';
import { loadSave, saveSave, type SaveData } from './game/store';
import { setMusic, setSound, startMusic } from './game/audio';
import { MAX_LEVEL } from './game/level';

export type Screen = 'menu' | 'loading' | 'game' | 'win' | 'lose' | 'congrats';

export interface RoundResult {
  stars: number;
  score: number;
  coinsEarned: number;
  combos: number;
  maxCombo: number;
  timeLeft: number;
  totalTime: number;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [save, setSave] = useState<SaveData>(() => loadSave());
  const [result, setResult] = useState<RoundResult | null>(null);
  const [showDaily, setShowDaily] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [loadingNextLevel, setLoadingNextLevel] = useState(false);
  const audioInitRef = useRef(false);

  // Mirror sound/music settings to engine
  useEffect(() => { setSound(save.sound); }, [save.sound]);
  useEffect(() => { setMusic(save.music); }, [save.music]);
  useEffect(() => { saveSave(save); }, [save]);

  // Auto-show daily reward once a day on menu
  useEffect(() => {
    if (screen !== 'menu') return;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    if (now - save.lastDailyTs > dayMs - 1000) {
      const t = setTimeout(() => setShowDaily(true), 700);
      return () => clearTimeout(t);
    }
  }, [screen, save.lastDailyTs]);

  const initAudio = useCallback(() => {
    if (audioInitRef.current) return;
    audioInitRef.current = true;
    if (save.music) startMusic();
  }, [save.music]);

  const handlePlay = () => {
    initAudio();
    setLoadingNextLevel(false);
    setScreen('loading');
  };

  const handleLoadingComplete = () => setScreen('game');

  const handleWin = (r: RoundResult) => {
    setResult(r);
    setSave((s) => ({
      ...s,
      coins: s.coins + r.coinsEarned,
      bestStars: { ...s.bestStars, [s.level]: Math.max(s.bestStars[s.level] || 0, r.stars) },
    }));
    setScreen('win');
  };

  const handleLose = (r: RoundResult) => {
    setResult(r);
    setScreen('lose');
  };

  const handleNextLevel = () => {
    // If we just beat the final level, show the Congratulations screen.
    if (save.level >= MAX_LEVEL) {
      setScreen('congrats');
      return;
    }
    setSave((s) => ({ ...s, level: Math.min(MAX_LEVEL, s.level + 1) }));
    setLoadingNextLevel(true);
    setScreen('loading');
  };

  const handleReplayFromStart = () => {
    setSave((s) => ({ ...s, level: 1 }));
    setLoadingNextLevel(true);
    setScreen('loading');
  };

  const totalStarsEarned = Object.values(save.bestStars).reduce((a, b) => a + b, 0);

  const [replayNonce, setReplayNonce] = useState(0);
  const handleReplay = () => {
    setReplayNonce((n) => n + 1);
    setLoadingNextLevel(true);
    setScreen('loading');
  };

  const handleQuitToMenu = () => setScreen('menu');

  const updateBoosters = (b: Partial<SaveData['boosters']>) =>
    setSave((s) => ({ ...s, boosters: { ...s.boosters, ...b } }));

  const updateCoins = (delta: number) =>
    setSave((s) => ({ ...s, coins: Math.max(0, s.coins + delta) }));

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at top, #ffb84d 0%, #ff7e3d 35%, #c2185b 80%, #4a148c 100%)',
      }}
      onPointerDown={initAudio}
    >
      {/* Portrait safe-area container */}
      <div className="absolute inset-0 mx-auto" style={{ maxWidth: 520 }}>
        {screen === 'menu' && (
          <MainMenu
            save={save}
            onPlay={handlePlay}
            onSettings={() => setShowSettings(true)}
            onShop={() => setShowShop(true)}
            onDaily={() => setShowDaily(true)}
            toggleSound={() => setSave((s) => ({ ...s, sound: !s.sound }))}
            toggleMusic={() => setSave((s) => ({ ...s, music: !s.music }))}
          />
        )}
        {screen === 'loading' && (
          <LoadingScreen level={save.level} continued={loadingNextLevel} onDone={handleLoadingComplete} />
        )}
        {screen === 'game' && (
          <GameScreen
            key={`lvl-${save.level}-${replayNonce}`}
            level={save.level}
            boosters={save.boosters}
            updateBoosters={updateBoosters}
            coins={save.coins}
            updateCoins={updateCoins}
            onWin={handleWin}
            onLose={handleLose}
            onQuit={handleQuitToMenu}
          />
        )}
        {screen === 'win' && result && (
          <WinScreen
            result={result}
            level={save.level}
            isLastLevel={save.level >= MAX_LEVEL}
            onNext={handleNextLevel}
            onReplay={handleReplay}
            onMenu={handleQuitToMenu}
          />
        )}
        {screen === 'congrats' && (
          <CongratsScreen
            totalStars={totalStarsEarned}
            onReplay={handleReplayFromStart}
            onMenu={handleQuitToMenu}
          />
        )}
        {screen === 'lose' && result && (
          <LoseScreen
            result={result}
            coins={save.coins}
            onRetry={handleReplay}
            onMenu={handleQuitToMenu}
            onContinue={() => {
              // Continue with +30s booster, costs 80 coins
              if (save.coins >= 80) {
                updateCoins(-80);
                setScreen('game');
              }
            }}
          />
        )}
        {showDaily && (
          <DailyRewardModal
            save={save}
            onClaim={(reward: Reward) => {
              setSave((s) => {
                const next = { ...s, lastDailyTs: Date.now(), dailyDay: (s.dailyDay % 7) + 1 };
                if (reward.coins) next.coins += reward.coins;
                if (reward.booster) {
                  const bk = reward.booster as BoosterKey;
                  next.boosters = { ...next.boosters, [bk]: next.boosters[bk] + (reward.amount || 1) };
                }
                return next;
              });
              setShowDaily(false);
            }}
            onClose={() => setShowDaily(false)}
          />
        )}
        {showSettings && (
          <SettingsModal
            save={save}
            toggleSound={() => setSave((s) => ({ ...s, sound: !s.sound }))}
            toggleMusic={() => setSave((s) => ({ ...s, music: !s.music }))}
            toggleRemoveAds={() => setSave((s) => ({ ...s, removeAds: !s.removeAds }))}
            onClose={() => setShowSettings(false)}
          />
        )}
        {showShop && (
          <ShopModal
            save={save}
            onClose={() => setShowShop(false)}
            onPurchaseCoins={(amt: number) => setSave((s) => ({ ...s, coins: s.coins + amt }))}
            onPurchaseBooster={(k: BoosterKey, amt: number, cost: number) => {
              if (save.coins < cost) return;
              setSave((s) => ({
                ...s,
                coins: s.coins - cost,
                boosters: { ...s.boosters, [k]: s.boosters[k] + amt },
              }));
            }}
          />
        )}
      </div>
    </div>
  );
}
