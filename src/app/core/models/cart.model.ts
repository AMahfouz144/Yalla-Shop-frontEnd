export interface ICart {
  items: ICartItem[];
  totalPrice: number;
  totalItems: number;
}

export interface ICartItem {
  product: string;        // product ID
  name: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}
