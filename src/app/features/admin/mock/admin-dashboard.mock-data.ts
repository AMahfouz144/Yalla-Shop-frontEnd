import {
  AdminCategory,
  AdminSeller,
  AdminUser,
  ProductStatus
} from '../models/admin.models';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createProduct(
  id: string,
  name: string,
  price: number,
  status: ProductStatus,
  categoryId: string,
  categoryName: string,
  sellerId: string,
  sellerName: string,
  createdAt: string
) {
  return {
    id,
    name,
    price,
    status,
    categoryId,
    categoryName,
    sellerId,
    sellerName,
    createdAt
  };
}

const baseUsers: AdminUser[] = [
  {
    id: 'usr-admin-01',
    name: 'Mariam Hassan',
    email: 'mariam.admin@yalla-shop.com',
    role: 'Admin',
    isActive: true,
    createdAt: '2026-01-08T09:30:00Z'
  },
  {
    id: 'usr-seller-01',
    name: 'Omar Salem',
    email: 'omar.salem@merchants.yalla-shop.com',
    role: 'Seller',
    isActive: true,
    createdAt: '2026-02-11T10:00:00Z',
    sellerApprovalStatus: 'Approved',
    storeName: 'Salem Tech'
  },
  {
    id: 'usr-seller-02',
    name: 'Nour Ali',
    email: 'nour.ali@merchants.yalla-shop.com',
    role: 'Seller',
    isActive: false,
    createdAt: '2026-03-04T08:15:00Z',
    sellerApprovalStatus: 'Pending',
    storeName: 'Nour Home'
  },
  {
    id: 'usr-seller-03',
    name: 'Hossam Adel',
    email: 'hossam.adel@merchants.yalla-shop.com',
    role: 'Seller',
    isActive: false,
    createdAt: '2026-03-19T14:45:00Z',
    sellerApprovalStatus: 'Rejected',
    storeName: 'Adel Fashion'
  },
  {
    id: 'usr-customer-01',
    name: 'Laila Farouk',
    email: 'laila.farouk@example.com',
    role: 'Customer',
    isActive: true,
    createdAt: '2026-02-24T16:20:00Z'
  },
  {
    id: 'usr-customer-02',
    name: 'Yousef Reda',
    email: 'yousef.reda@example.com',
    role: 'Customer',
    isActive: false,
    createdAt: '2026-03-02T18:10:00Z'
  },
  {
    id: 'usr-customer-03',
    name: 'Salma Kamal',
    email: 'salma.kamal@example.com',
    role: 'Customer',
    isActive: true,
    createdAt: '2026-03-29T11:55:00Z'
  }
];

const baseCategories: AdminCategory[] = [
  {
    id: 'cat-01',
    name: 'Electronics',
    description: 'Devices, accessories, and smart gadgets from approved marketplace sellers.',
    products: [
      createProduct('prd-01', 'Noise Cancelling Headphones', 2999, 'Pending', 'cat-01', 'Electronics', 'usr-seller-01', 'Omar Salem', '2026-04-15T10:00:00Z'),
      createProduct('prd-02', 'Portable Speaker Pro', 1850, 'Accepted', 'cat-01', 'Electronics', 'usr-seller-01', 'Omar Salem', '2026-04-10T08:30:00Z'),
      createProduct('prd-03', 'Wireless Mouse X2', 720, 'Rejected', 'cat-01', 'Electronics', 'usr-seller-02', 'Nour Ali', '2026-04-09T14:00:00Z')
    ]
  },
  {
    id: 'cat-02',
    name: 'Home Decor',
    description: 'Decor, lighting, and home styling products managed by the marketplace team.',
    products: [
      createProduct('prd-04', 'Minimal Table Lamp', 1150, 'Pending', 'cat-02', 'Home Decor', 'usr-seller-02', 'Nour Ali', '2026-04-16T12:15:00Z'),
      createProduct('prd-05', 'Marble Coffee Table', 5400, 'Accepted', 'cat-02', 'Home Decor', 'usr-seller-02', 'Nour Ali', '2026-04-02T09:10:00Z')
    ]
  },
  {
    id: 'cat-03',
    name: 'Fashion',
    description: 'Clothing and accessories with approval workflow for new seller submissions.',
    products: [
      createProduct('prd-06', 'Classic Linen Shirt', 890, 'Accepted', 'cat-03', 'Fashion', 'usr-seller-03', 'Hossam Adel', '2026-04-06T13:00:00Z'),
      createProduct('prd-07', 'Leather Crossbody Bag', 2300, 'Pending', 'cat-03', 'Fashion', 'usr-seller-03', 'Hossam Adel', '2026-04-17T10:40:00Z'),
      createProduct('prd-08', 'Oversized Hoodie', 980, 'Rejected', 'cat-03', 'Fashion', 'usr-seller-03', 'Hossam Adel', '2026-04-01T16:30:00Z')
    ]
  },
  {
    id: 'cat-04',
    name: 'Beauty',
    description: 'Beauty essentials and wellness items with marketplace quality control.',
    products: [
      createProduct('prd-09', 'Hydrating Face Serum', 640, 'Accepted', 'cat-04', 'Beauty', 'usr-seller-01', 'Omar Salem', '2026-04-08T07:25:00Z'),
      createProduct('prd-10', 'Spa Candle Set', 420, 'Pending', 'cat-04', 'Beauty', 'usr-seller-01', 'Omar Salem', '2026-04-18T09:50:00Z')
    ]
  }
];

export function createAdminMockState(): { users: AdminUser[]; categories: AdminCategory[] } {
  return {
    users: clone(baseUsers),
    categories: clone(baseCategories)
  };
}

export function createMockSellers(users: AdminUser[], categories: AdminCategory[]): AdminSeller[] {
  const productCounts = categories
    .flatMap((category) => category.products)
    .reduce<Record<string, number>>((accumulator, product) => {
      accumulator[product.sellerId] = (accumulator[product.sellerId] ?? 0) + 1;
      return accumulator;
    }, {});

  return users
    .filter((user): user is AdminSeller => user.role === 'Seller' && !!user.sellerApprovalStatus && !!user.storeName)
    .map((seller) => ({
      ...seller,
      productsCount: productCounts[seller.id] ?? 0
    }));
}
