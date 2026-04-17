export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: ICategory;
  seller: string;       // seller user ID
  images: string[];
  stock: number;
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}
