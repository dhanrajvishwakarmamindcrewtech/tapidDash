import { LOYALTY_CONFIG } from "../config/loyaltyConfig";

export const formatCurrency = (amount, currency = LOYALTY_CONFIG.currency) => {
  if (typeof amount !== "number") return "€0.00";
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (typeof num !== "number") return "0";
  return num.toLocaleString();
};

export const formatKPIData = (customerStats) => {
  if (!customerStats) return [];

  const kpiData = [
    {
      title: "Total Customers",
      value: formatNumber(customerStats.totalCustomers),
      icon: "Users",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(customerStats.totalRevenue),
      icon: "Euro",
    },
    {
      title: "Total Transactions",
      value: formatNumber(customerStats.totalTransactions),
      icon: "BarChart3",
    },
    {
      title: "Avg. Order Value",
      value: formatCurrency(customerStats.avgOrderValue),
      icon: "TrendingUp",
    },
  ];

  return kpiData;
};

export const formatTierText = (rewardText, points) => {
  if (!rewardText || !points) return null;
  const euros = (points / LOYALTY_CONFIG.pointsPerEuro).toFixed(2);
  return `${rewardText} at ${points} pts (€${euros} spent)`;
};
