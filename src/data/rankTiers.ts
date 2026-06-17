/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RankTier {
  minPoints: number;
  rank: string;
  badgeName: string;
  icon: string;
  desc: string;
}

export const RANK_TIERS: RankTier[] = [
  { minPoints: 0, rank: "Seedling", badgeName: "Seedling Badge", icon: "🌱", desc: "First step on your journey." },
  { minPoints: 200, rank: "Sprouting", badgeName: "Eco Apprentice", icon: "🌱", desc: "Starting your sustainable habit journey." },
  { minPoints: 500, rank: "Sapling", badgeName: "Sapling Steward", icon: "🌳", desc: "First major milestone threshold secured." },
  { minPoints: 1000, rank: "Bamboo Walker", badgeName: "Bamboo Walker Badge", icon: "🎋", desc: "Unlocking advanced energy conservation rules." },
  { minPoints: 2000, rank: "Grove Guardian", badgeName: "Forest Guardian", icon: "🛡️", desc: "Consistently mitigating municipal footprints." },
  { minPoints: 4000, rank: "Forest Keeper", badgeName: "Forest Keeper Rank", icon: "🌲", desc: "Elite ecological stewardship level." },
  { minPoints: 7500, rank: "Earth Steward", badgeName: "Climate Legend Master", icon: "🌍", desc: "Legendary status, steering grids in real time." },
  { minPoints: 15000, rank: "Carbon Champion", badgeName: "Carbon Champion Status", icon: "👑", desc: "Absolute pinnacle of preservation power." },
];

export function getRankForPoints(points: number): string {
  let activeRank = "Seedling";
  // Iterate from highest threshold to lowest
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (points >= RANK_TIERS[i].minPoints) {
      activeRank = RANK_TIERS[i].rank;
      break;
    }
  }
  return activeRank;
}

export function getMilestoneTiers() {
  // Return tiers starting from Sprouting (200 pts) for milestone tracking components
  return RANK_TIERS.filter(tier => tier.minPoints > 0);
}
