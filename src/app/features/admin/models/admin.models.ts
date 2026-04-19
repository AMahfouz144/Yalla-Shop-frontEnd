export type AdminUserRole = 'Admin' | 'Seller' | 'Customer';
export type ProductStatus = 'Pending' | 'Accepted' | 'Rejected';
export type SellerApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface AdminDashboardSummary {
  totalUsers: number;
  totalSellers: number;
  totalCategories: number;
  totalProducts: number;
  pendingProducts: number;
  disabledUsers: number;
  pendingSellers: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  isActive: boolean;
  createdAt: string;
  sellerApprovalStatus?: SellerApprovalStatus;
  storeName?: string;
}

export interface AdminSeller extends AdminUser {
  role: 'Seller';
  sellerApprovalStatus: SellerApprovalStatus;
  storeName: string;
  productsCount: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  status: ProductStatus;
  categoryId: string;
  categoryName: string;
  sellerId: string;
  sellerName: string;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  description: string;
  products: AdminProduct[];
}

export interface AdminNavigationItem {
  label: string;
  route: string;
  icon: string;
  helperText: string;
}
