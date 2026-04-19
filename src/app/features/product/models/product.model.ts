export enum ProductStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  picture: string | null;
  status: ProductStatus;
  categoryId: number;
  sellerId: number | null;
  createdAt: string;
}

export interface ProductFilterParams {
  name?: string;
  description?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  stockQuantity?: number | null;
  categoryName?: string;
  createdFrom?: string | null;
  createdTo?: string | null;
  sortBy?: string;
  sortOrder?: string;
}

export interface ProductFormValue {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  sellerId: number | null;
  status: ProductStatus;
}
