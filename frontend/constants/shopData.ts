/**
 * Shop Data - Items available for purchase with coins
 */

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'theme' | 'powerup' | 'cosmetic';
  icon: string;
}

// ============================================
// THEME ITEMS
// ============================================

export const THEME_ITEMS: ShopItem[] = [
  {
    id: 'theme_golden',
    name: 'Golden Circuit',
    description: 'Luxurious gold-plated aesthetics',
    price: 1000,
    type: 'theme',
    icon: '🌟',
  },
  {
    id: 'theme_ice',
    name: 'Ice Protocol',
    description: 'Cool blue frozen data streams',
    price: 1500,
    type: 'theme',
    icon: '❄️',
  },
  {
    id: 'theme_fire',
    name: 'Firewall',
    description: 'Blazing hot security theme',
    price: 2000,
    type: 'theme',
    icon: '🔥',
  },
  {
    id: 'theme_midnight',
    name: 'Midnight Hacker',
    description: 'Deep purple stealth mode',
    price: 2500,
    type: 'theme',
    icon: '🌙',
  },
  {
    id: 'theme_toxic',
    name: 'Toxic',
    description: 'Radioactive green glow',
    price: 3000,
    type: 'theme',
    icon: '☢️',
  },
];

// ============================================
// POWER-UP ITEMS
// ============================================

export const POWERUP_ITEMS: ShopItem[] = [
  {
    id: 'hint_pack_3',
    name: '3x Hints',
    description: 'Get help when you need it',
    price: 150,
    type: 'powerup',
    icon: '💡',
  },
  {
    id: 'hint_pack_10',
    name: '10x Hints',
    description: 'Bulk hint pack',
    price: 400,
    type: 'powerup',
    icon: '💡',
  },
  {
    id: 'time_freeze',
    name: 'Time Freeze',
    description: 'Pause timer for 30 seconds (Speed Run)',
    price: 300,
    type: 'powerup',
    icon: '⏸️',
  },
  {
    id: 'extra_moves_5',
    name: '+5 Moves',
    description: 'Extra moves in Endless mode',
    price: 200,
    type: 'powerup',
    icon: '➕',
  },
  {
    id: 'coin_boost',
    name: 'Coin Boost',
    description: '2x coins for next 3 wins',
    price: 500,
    type: 'powerup',
    icon: '💰',
  },
];

// ============================================
// COSMETIC ITEMS
// ============================================

export const COSMETIC_ITEMS: ShopItem[] = [
  {
    id: 'tile_glow',
    name: 'Tile Glow Effect',
    description: 'Enhanced glow on powered tiles',
    price: 800,
    type: 'cosmetic',
    icon: '✨',
  },
  {
    id: 'particle_trail',
    name: 'Particle Trails',
    description: 'Fancy particle effects on moves',
    price: 1200,
    type: 'cosmetic',
    icon: '🌈',
  },
  {
    id: 'custom_cursor',
    name: 'Cyber Cursor',
    description: 'Futuristic cursor design',
    price: 600,
    type: 'cosmetic',
    icon: '🎯',
  },
];

// ============================================
// ALL ITEMS
// ============================================

export const ALL_SHOP_ITEMS: ShopItem[] = [
  ...THEME_ITEMS,
  ...POWERUP_ITEMS,
  ...COSMETIC_ITEMS,
];

/**
 * Get item by ID
 */
export function getShopItem(itemId: string): ShopItem | undefined {
  return ALL_SHOP_ITEMS.find(item => item.id === itemId);
}

/**
 * Get items by type
 */
export function getItemsByType(type: ShopItem['type']): ShopItem[] {
  return ALL_SHOP_ITEMS.filter(item => item.type === type);
}
