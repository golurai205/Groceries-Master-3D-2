import { BRAND } from '../brand';

// Tiny in-memory store with persistence
const KEY = BRAND.saveKey;          // new key: 'grocerymaster3d-save'
const LEGACY_KEY = 'tilemaster3d-save'; // for one-time migration from old builds

export interface SaveData {
  coins: number;
  level: number;
  boosters: { undo: number; shuffle: number; magnet: number; freeze: number };
  sound: boolean;
  music: boolean;
  removeAds: boolean;
  dailyDay: number;          // next day to claim (1..7)
  lastDailyTs: number;       // last claim timestamp ms
  bestStars: Record<number, number>;
}

const defaultSave: SaveData = {
  coins: 350,
  level: 1,
  boosters: { undo: 3, shuffle: 2, magnet: 2, freeze: 1 },
  sound: true,
  music: true,
  removeAds: false,
  dailyDay: 1,
  lastDailyTs: 0,
  bestStars: {},
};

export function loadSave(): SaveData {
  try {
    let raw = localStorage.getItem(KEY);
    if (!raw) {
      // Migrate any existing progress from the previous build's key.
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        raw = legacy;
        try { localStorage.setItem(KEY, legacy); localStorage.removeItem(LEGACY_KEY); } catch {}
      }
    }
    if (!raw) return { ...defaultSave };
    const data = JSON.parse(raw);
    return { ...defaultSave, ...data, boosters: { ...defaultSave.boosters, ...(data.boosters || {}) } };
  } catch {
    return { ...defaultSave };
  }
}

export function saveSave(s: SaveData) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}
