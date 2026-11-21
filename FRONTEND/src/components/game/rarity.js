/** Rarity tiers, derived from price so every item gets a border colour without extra data. */
export const RARITIES = [
  { id: 'common', label: 'Common', color: '#c9d1cc', min: 0 },
  { id: 'uncommon', label: 'Uncommon', color: '#6fbf8e', min: 40 },
  { id: 'rare', label: 'Rare', color: '#5b9be6', min: 70 },
  { id: 'epic', label: 'Epic', color: '#a56fe0', min: 100 },
  { id: 'legendary', label: 'Legendary', color: '#f0a92e', min: 150 },
]

export const rarityOf = (price) => [...RARITIES].reverse().find((tier) => price >= tier.min)
