export type AdminProductStatusCode = 0 | 1 | 2;

export interface AdminDashboardSummary {
  totalCustomers: number;
  totalSellers: number;
  totalProducts: number;
  pendingProducts: number;
  activeCustomers: number;
  activeSellers: number;
}

export interface AdminManagedUser {
  id: string;
  fullName: string;
  userName: string;
  isActive: boolean;
  statusLabel: 'Active' | 'Deleted';
}

export interface AdminCustomer extends AdminManagedUser {}

export interface AdminSeller extends AdminManagedUser {}

export interface AdminProduct {
  id: string;
  productName: string;
  image: string;
  price: number;
  stockQuantity: number;
  status: AdminProductStatusCode;
  categoryId: string;
  sellerId: string;
}

export interface AdminNavigationItem {
  label: string;
  route: string;
  icon: string;
  helperText: string;
}
