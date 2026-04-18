export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  isInStock: boolean;
}

export interface CartSummary {
  id: string;
  userId: string;
  items: CartItem[];
  itemsCount: number;
  subTotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  promoCodeApplied?: string;
}
