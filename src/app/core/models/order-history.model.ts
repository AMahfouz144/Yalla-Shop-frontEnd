/** Matches the OrderStatus enum on the backend (YallaShop.Domain). */
export enum OrderStatus {
  Pending    = 1,
  Processing = 2,
  Shipped    = 3,
  Delivered  = 4,
  Cancelled  = 5
}

export interface ShippingAddressDto {
  id: number;
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
}

export interface OrderItemResponseDto {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderResponseDto {
  id: number;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;            // ISO 8601 date-time string from the API
  shippingAddress?: ShippingAddressDto;
  paymentMethod?: string;
  paymentStatus?: string;
  items: OrderItemResponseDto[];
}

/** Human-readable labels for each OrderStatus value. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.Pending]:    'Pending',
  [OrderStatus.Processing]: 'Processing',
  [OrderStatus.Shipped]:    'Shipped',
  [OrderStatus.Delivered]:  'Delivered',
  [OrderStatus.Cancelled]:  'Cancelled',
};
