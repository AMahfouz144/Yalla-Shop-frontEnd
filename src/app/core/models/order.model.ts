export interface IOrder {
  _id: string;
  user: string;           // customer user ID
  items: IOrderItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  paymentMethod: string;
  isPaid: boolean;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderItem {
  product: string;        // product ID
  name: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;         // seller user ID
}
