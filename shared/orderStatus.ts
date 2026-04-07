export const ORDER_STATUS = [
  "Accepted",
  "In Progress",
  "Stitching",
  "Ready",
  "Shipped",
  "Pickup"
] as const;

export type OrderStatus = typeof ORDER_STATUS[number];
