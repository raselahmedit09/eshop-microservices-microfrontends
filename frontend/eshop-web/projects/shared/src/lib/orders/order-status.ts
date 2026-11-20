// Ordering.Domain.Enums.OrderStatus. The API sends the number; these are the names to show.
export const OrderStatus = {
  Draft: 1,
  Pending: 2,
  Completed: 3,
  Cancelled: 4,
} as const;

export const ORDER_STATUS_NAME: Record<number, string> = {
  [OrderStatus.Draft]: 'Draft',
  [OrderStatus.Pending]: 'Pending',
  [OrderStatus.Completed]: 'Completed',
  [OrderStatus.Cancelled]: 'Cancelled',
};
