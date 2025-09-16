export const KPI_CONFIG = [
  {
    key: "totalCustomers",
    title: "Total Customers",
    description: "Unique customers who made transactions",
    icon: "Users",
    format: "number",
    dataPath: "totalCustomers",
  },
  {
    key: "totalRevenue",
    title: "Total Revenue",
    description: "Total revenue from all transactions",
    icon: "Euro",
    format: "currency",
    dataPath: "totalRevenue",
  },
  {
    key: "totalTransactions",
    title: "Total Transactions",
    description: "Number of completed transactions",
    icon: "BarChart3",
    format: "number",
    dataPath: "totalTransactions",
  },
  {
    key: "avgOrderValue",
    title: "Avg. Order Value",
    description: "Average amount per transaction",
    icon: "TrendingUp",
    format: "currency",
    dataPath: "avgOrderValue",
  },
];
