export type ItemType =
  | 'apple'
  | 'banana'
  | 'milk'
  | 'bread'
  | 'cheese'
  | 'donut'
  | 'juice'
  | 'carrot'
  | 'egg';

export const ALL_ITEMS: ItemType[] = [
  'apple',
  'banana',
  'milk',
  'bread',
  'cheese',
  'donut',
  'juice',
  'carrot',
  'egg',
];

export const ITEM_META: Record<ItemType, { name: string; emoji: string; color: string }> = {
  apple: { name: 'Apple', emoji: '🍎', color: '#ff4757' },
  banana: { name: 'Banana', emoji: '🍌', color: '#ffd93d' },
  milk: { name: 'Milk', emoji: '🥛', color: '#ffffff' },
  bread: { name: 'Bread', emoji: '🍞', color: '#d4a574' },
  cheese: { name: 'Cheese', emoji: '🧀', color: '#ffc93c' },
  donut: { name: 'Donut', emoji: '🍩', color: '#f8a4c9' },
  juice: { name: 'Juice', emoji: '🧃', color: '#ff8c42' },
  carrot: { name: 'Carrot', emoji: '🥕', color: '#ff7f1f' },
  egg: { name: 'Eggs', emoji: '🥚', color: '#fff5e1' },
};
