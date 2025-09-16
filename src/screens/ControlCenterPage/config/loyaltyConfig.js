export const LOYALTY_CONFIG = {
  pointsPerEuro: 10,
  currency: "EUR",
  maxTiers: 5,
  minTiers: 3,
  pointIncrement: 500,
  defaultTierPoints: [500, 1000, 2000],
};

export const CAMPAIGN_CONFIG = {
  autoGenSample: {
    campaignName: "Tapid Points Campaign",
    rewardDescription: "Free items for loyal spenders",
    tiers: [
      { rewardText: "Free Espresso", points: 500 },
      { rewardText: "Free Lunch Combo", points: 1000 },
      { rewardText: "10€ Voucher", points: 2000 },
    ],
    isActive: true,
  },
};
