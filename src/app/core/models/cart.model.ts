export interface CartItem {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
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
  totalAmount: number;
  promoCodeApplied?: string;
}
