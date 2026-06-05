import { ALL_ITEMS, type ItemType } from './items';

export interface PileItem {
  id: number;
  type: ItemType;
  x: number;
  y: number; // layer height
  z: number;
  rot: number;
  layer: number;
}

export interface LevelConfig {
  level: number;
  itemCount: number;   // multiple of 3
  typeCount: number;   // distinct types
  layers: number;
  time: number;        // seconds
}

export const MAX_LEVEL = 100;

/**
 * Exact timer brackets per spec.
 *   Levels   1 –   5 : 30s
 *   Levels   6 –  15 : 40s
 *   Levels  16 –  30 : 40s
 *   Levels  31 –  50 : 40s
 *   Levels  51 –  70 : 30s
 *   Levels  71 – 100 : 30s
 */
export function getLevelTime(level: number): number {
  const L = Math.max(1, Math.min(MAX_LEVEL, level));
  if (L <= 5) return 30;
  if (L <= 50) return 40;     // covers 6-15, 16-30, 31-50
  return 30;                  // covers 51-70, 71-100
}

/**
 * Difficulty curve, balanced so every level is solvable
 * within its bracket's time budget. We INCREASE difficulty
 * via layers + type variety rather than just item count,
 * and we CAP items per bracket so the clock is never the
 * bottleneck.
 *
 * Realistic player throughput:
 *   ~1 deliberate tap every 0.8–1.2s (incl. scanning the pile).
 *   30s window  ≈ 25–30 confident taps  → max ~30 items
 *   40s window  ≈ 35–45 confident taps  → max ~60 items
 *
 * All item counts are forced to be a multiple of 3 so every
 * level is mathematically solvable.
 */
export function getLevelConfig(level: number): LevelConfig {
  const L = Math.max(1, Math.min(MAX_LEVEL, level));
  const time = getLevelTime(L);

  let itemCount: number;
  let typeCount: number;
  let layers: number;

  if (L <= 5) {
    // 30s — gentle intro
    const idx = L - 1;                            // 0..4
    itemCount = 18 + idx * 3;                     // 18, 21, 24, 27, 30
    typeCount = 3;
    layers = idx < 2 ? 1 : 2;
  } else if (L <= 15) {
    // 40s — ramping up
    const idx = L - 6;                            // 0..9
    itemCount = 33 + idx * 3;                     // 33..60 (capped below)
    typeCount = 4 + Math.floor(idx / 4);          // 4..6
    layers = 2 + Math.floor(idx / 5);             // 2..3
  } else if (L <= 30) {
    // 40s — more layers & types
    const idx = L - 16;                           // 0..14
    itemCount = 45 + idx;                         // 45..59 → snapped to 45..57 by /3
    typeCount = 5 + Math.floor(idx / 5);          // 5..7
    layers = 3 + Math.floor(idx / 7);             // 3..5
  } else if (L <= 50) {
    // 40s — peak of the 40-second bracket
    const idx = L - 31;                           // 0..19
    itemCount = 54 + Math.floor(idx / 2) * 3;     // 54..81 capped at 60
    typeCount = 6 + Math.floor(idx / 7);          // 6..8
    layers = 4 + Math.floor(idx / 10);            // 4..5
  } else if (L <= 70) {
    // 30s — less time, so FEWER items, more spatial puzzle
    const idx = L - 51;                           // 0..19
    itemCount = 27 + Math.floor(idx / 4) * 3;     // 27..39 capped
    typeCount = 6 + Math.floor(idx / 5);          // 6..9
    layers = 3 + Math.floor(idx / 10);            // 3..4
  } else {
    // 71-100 — 30s ultimate. Many types, deep stacks, few items.
    const idx = L - 71;                           // 0..29
    itemCount = 30 + Math.floor(idx / 6) * 3;     // 30..42 capped
    typeCount = Math.min(9, 7 + Math.floor(idx / 10));  // 7..9
    layers = Math.min(5, 4 + Math.floor(idx / 15));     // 4..5
  }

  // Hard safety caps per timer bracket (clock-budget protection).
  // 30s ⇒ ≤ 45 items;  40s ⇒ ≤ 60 items.
  const maxByTime = time >= 40 ? 60 : 45;
  itemCount = Math.min(itemCount, maxByTime);

  // Force multiple of 3 (always solvable).
  itemCount = Math.max(9, Math.floor(itemCount / 3) * 3);

  // Clamp other params to safe ranges.
  typeCount = Math.max(2, Math.min(ALL_ITEMS.length, typeCount));
  layers = Math.max(1, Math.min(5, layers));

  return { level: L, itemCount, typeCount, layers, time };
}

let nextId = 1;
export function resetIds() { nextId = 1; }

function rand(seed: { v: number }) {
  seed.v = (seed.v * 9301 + 49297) % 233280;
  return seed.v / 233280;
}

export function generateLevel(cfg: LevelConfig, seedNum = Date.now()): PileItem[] {
  const seed = { v: seedNum % 233280 || 1 };
  // pick types
  const typesPool = [...ALL_ITEMS].sort(() => rand(seed) - 0.5).slice(0, cfg.typeCount);
  // ensure items are multiples of 3 of selected types
  const counts: Record<string, number> = {};
  typesPool.forEach((t) => (counts[t] = 0));
  let total = 0;
  while (total < cfg.itemCount) {
    const t = typesPool[Math.floor(rand(seed) * typesPool.length)];
    counts[t] += 3;
    total += 3;
  }
  // build flat list
  const list: ItemType[] = [];
  Object.entries(counts).forEach(([t, n]) => {
    for (let i = 0; i < n; i++) list.push(t as ItemType);
  });
  // shuffle
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rand(seed) * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  // place items: distribute over layers in a circular footprint
  const perLayer = Math.ceil(list.length / cfg.layers);
  const items: PileItem[] = [];
  let idx = 0;
  for (let layer = 0; layer < cfg.layers; layer++) {
    const n = Math.min(perLayer, list.length - idx);
    if (n <= 0) break;
    // grid-ish but jittered
    const cols = Math.ceil(Math.sqrt(n * 1.1));
    const rows = Math.ceil(n / cols);
    const spread = 2.6; // table footprint half-extent
    let k = 0;
    for (let r = 0; r < rows && k < n; r++) {
      for (let c = 0; c < cols && k < n; c++) {
        const tx = (c + 0.5) / cols - 0.5;
        const tz = (r + 0.5) / rows - 0.5;
        const jitterX = (rand(seed) - 0.5) * 0.25;
        const jitterZ = (rand(seed) - 0.5) * 0.25;
        items.push({
          id: nextId++,
          type: list[idx++],
          x: tx * spread * 2 + jitterX,
          y: layer * 0.85 + 0.0,
          z: tz * spread * 2 + jitterZ,
          rot: rand(seed) * Math.PI * 2,
          layer,
        });
        k++;
      }
    }
  }
  return items;
}

/**
 * An item is "free" (tappable) if no other item with greater y overlaps it in XZ.
 */
export function computeFreeMap(items: PileItem[]): Record<number, boolean> {
  const map: Record<number, boolean> = {};
  const R = 0.45; // approximate item radius for overlap
  for (const it of items) {
    let covered = false;
    for (const other of items) {
      if (other.id === it.id) continue;
      if (other.y <= it.y + 0.1) continue;
      const dx = other.x - it.x;
      const dz = other.z - it.z;
      if (dx * dx + dz * dz < R * R * 1.4) { covered = true; break; }
    }
    map[it.id] = !covered;
  }
  return map;
}
