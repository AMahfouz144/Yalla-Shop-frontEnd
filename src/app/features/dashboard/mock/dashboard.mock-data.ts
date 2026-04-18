import {
  AdminOverviewData,
  ApiResponse,
  BannerItem,
  ChartCardData,
  DashboardCollectionCard,
  DashboardMode,
  DashboardShellData,
  DashboardTableData,
  DashboardTableRow,
  EngagementSetting,
  LoyaltySummary,
  MarketingOverviewData,
  ReferralPanelData,
  SellerOrderItem,
  SellerOverviewData,
  StatCardData,
  TableAction,
  TableCellProduct,
  TableCellStatus,
  TableCellStock,
  WorkspacePageData,
  WorkspacePageKey
} from '../models/dashboard.models';

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createSvgAvatar(label: string, gradientStart: string, gradientEnd: string): string {
  const safeLabel = encodeURIComponent(label);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${gradientStart}" />
          <stop offset="100%" stop-color="${gradientEnd}" />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="26" fill="url(#g)" />
      <text x="50%" y="54%" text-anchor="middle" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="700">${safeLabel}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function currencyTable(
  title: string,
  description: string,
  rows: DashboardTableRow[],
  primaryActionLabel?: string,
  primaryActionIcon?: string
): DashboardTableData {
  return {
    title,
    description,
    pageSize: 4,
    primaryActionLabel,
    primaryActionIcon,
    columns: [
      { key: 'product', label: 'Product', type: 'product', sortable: true },
      { key: 'currentStock', label: 'Current Stock', type: 'stock', sortable: true },
      { key: 'price', label: 'Price', type: 'currency', sortable: true, align: 'right' },
      { key: 'actions', label: 'Actions', type: 'actions', align: 'right' }
    ],
    rows
  };
}

function status(label: string, tone: TableCellStatus['tone']): TableCellStatus {
  return { label, tone };
}

function stock(value: number, label: string, tone: TableCellStock['tone']): TableCellStock {
  return { value, label, tone };
}

function product(title: string, subtitle: string, initials: string, start: string, end: string): TableCellProduct {
  return {
    title,
    subtitle,
    imageUrl: createSvgAvatar(initials, start, end)
  };
}

function actions(...items: TableAction[]): TableAction[] {
  return items;
}

const shellResponse: ApiResponse<DashboardShellData> = {
  success: true,
  timestamp: '2026-04-17T10:00:00Z',
  data: {
    brand: {
      name: 'Yalla Commerce',
      tagline: 'Control room for marketplace growth'
    },
    searchPlaceholder: 'Search products, orders, pages, banners...',
    notificationCount: 7,
    user: {
      id: 'usr_01',
      name: 'Ava Collins',
      email: 'ava.collins@yalla.shop',
      role: 'Platform Director',
      avatarUrl: createSvgAvatar('AC', '#2563eb', '#0f172a')
    },
    modes: [
      { id: 'admin', label: 'Admin Overview', description: 'Marketplace operations and approvals' },
      { id: 'seller', label: 'Seller Dashboard', description: 'Store performance and inventory' },
      { id: 'marketing', label: 'Marketing / Loyalty', description: 'Retention, referrals, and rewards' }
    ],
    notifications: [
      { id: 'ntf_01', title: '18 new products are waiting for approval', time: '5 min ago', read: false },
      { id: 'ntf_02', title: 'Revenue passed the monthly target by 8.4%', time: '18 min ago', read: false },
      { id: 'ntf_03', title: 'Spring campaign banners need review', time: '1 hour ago', read: true }
    ],
    navigation: [
      { id: 'overview', label: 'Dashboard', icon: 'dashboard_customize', path: ['overview'] },
      {
        id: 'products',
        label: 'Product Management',
        icon: 'inventory_2',
        children: [
          { id: 'categories', label: 'Categories', icon: 'category', path: ['products', 'categories'] },
          { id: 'inventory', label: 'Inventory', icon: 'warehouse', path: ['products', 'inventory'] },
          {
            id: 'pending-approvals',
            label: 'Pending Approvals',
            icon: 'pending_actions',
            path: ['products', 'pending-approvals'],
            badge: '18'
          }
        ]
      },
      {
        id: 'orders',
        label: 'Order Management',
        icon: 'shopping_bag',
        children: [
          { id: 'shipping', label: 'Shipping', icon: 'local_shipping', path: ['orders', 'shipping'] }
        ]
      },
      {
        id: 'content',
        label: 'Content Management',
        icon: 'web_stories',
        children: [
          { id: 'banners', label: 'Banners', icon: 'photo_library', path: ['content', 'banners'] },
          { id: 'pages', label: 'Pages', icon: 'description', path: ['content', 'pages'] }
        ]
      },
      { id: 'marketing', label: 'Marketing', icon: 'campaign', path: ['marketing'] }
    ]
  }
};

const adminOverviewResponse: ApiResponse<AdminOverviewData> = {
  success: true,
  timestamp: '2026-04-17T10:00:00Z',
  data: {
    pageTitle: 'Admin Overview',
    summary: 'Monitor revenue, approve catalog updates, and keep every critical marketplace workflow moving in one place.',
    stats: [
      {
        id: 'sales',
        label: 'Total Sales',
        value: '$248,900',
        helperText: 'vs. last month',
        icon: 'payments',
        trend: 12.4,
        trendDirection: 'up',
        tone: 'success'
      },
      {
        id: 'users',
        label: 'Active Users',
        value: '18,320',
        helperText: '7-day active customers',
        icon: 'group',
        trend: 8.1,
        trendDirection: 'up',
        tone: 'info'
      },
      {
        id: 'orders',
        label: 'Pending Orders',
        value: '136',
        helperText: 'awaiting processing',
        icon: 'shopping_cart',
        trend: 4.3,
        trendDirection: 'down',
        tone: 'warning'
      },
      {
        id: 'products',
        label: 'Pending Products',
        value: '18',
        helperText: 'need approval review',
        icon: 'inventory',
        trend: 6.7,
        trendDirection: 'up',
        tone: 'danger'
      }
    ],
    recentOrders: {
      title: 'Recent Orders',
      description: 'Newest marketplace orders with sortable columns and quick operational visibility.',
      pageSize: 5,
      columns: [
        { key: 'orderId', label: 'Order ID', type: 'text', sortable: true },
        { key: 'customerName', label: 'Customer Name', type: 'text', sortable: true },
        { key: 'totalAmount', label: 'Total Amount', type: 'currency', sortable: true, align: 'right' },
        { key: 'status', label: 'Status', type: 'status', sortable: true }
      ],
      rows: [
        { id: 'ord_1001', orderId: '#1001', customerName: 'Olivia Hart', totalAmount: 324, status: status('Completed', 'success') },
        { id: 'ord_1002', orderId: '#1002', customerName: 'Marcus Young', totalAmount: 189, status: status('Processing', 'warning') },
        { id: 'ord_1003', orderId: '#1003', customerName: 'Sophia Turner', totalAmount: 502, status: status('Completed', 'success') },
        { id: 'ord_1004', orderId: '#1004', customerName: 'Noah Bennett', totalAmount: 96, status: status('Cancelled', 'danger') },
        { id: 'ord_1005', orderId: '#1005', customerName: 'Chloe Adams', totalAmount: 241, status: status('Processing', 'warning') },
        { id: 'ord_1006', orderId: '#1006', customerName: 'Daniel Ross', totalAmount: 128, status: status('Completed', 'success') },
        { id: 'ord_1007', orderId: '#1007', customerName: 'Amelia Reed', totalAmount: 415, status: status('Processing', 'info') }
      ]
    },
    revenue: {
      title: 'Monthly Revenue',
      subtitle: 'Placeholder chart using static data shaped like an API series response.',
      summaryValue: '$248.9K',
      summaryLabel: 'This month',
      chartType: 'line',
      points: [
        { label: 'Jan', value: 46 },
        { label: 'Feb', value: 52 },
        { label: 'Mar', value: 57 },
        { label: 'Apr', value: 61 },
        { label: 'May', value: 72 },
        { label: 'Jun', value: 68 },
        { label: 'Jul', value: 74 },
        { label: 'Aug', value: 81 },
        { label: 'Sep', value: 88 },
        { label: 'Oct', value: 96 },
        { label: 'Nov', value: 104 },
        { label: 'Dec', value: 118 }
      ]
    },
    banners: [
      {
        id: 'bnr_01',
        title: 'Mid-Season Collection Spotlight',
        placement: 'Homepage Hero',
        summary: 'High-visibility hero placement for curated spring launches.',
        status: status('Live', 'success'),
        accent: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 55%, #93c5fd 100%)',
        ctaLabel: 'Shop the drop'
      },
      {
        id: 'bnr_02',
        title: 'Seller Weekend Boost',
        placement: 'Category Landing',
        summary: 'Rotating banner for high-converting seller storefronts.',
        status: status('Scheduled', 'info'),
        accent: 'linear-gradient(135deg, #0f172a 0%, #334155 45%, #94a3b8 100%)',
        ctaLabel: 'Explore offers'
      },
      {
        id: 'bnr_03',
        title: 'Loyalty Double Points',
        placement: 'Checkout Promo',
        summary: 'Retention push encouraging repeat purchases at checkout.',
        status: status('Draft', 'warning'),
        accent: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 60%, #e0f2fe 100%)',
        ctaLabel: 'Activate reward'
      }
    ]
  }
};

const sellerInventoryRows: DashboardTableRow[] = [
  {
    id: 'prd_01',
    product: product('Nordic Oak Desk', 'SKU NO-204', 'ND', '#2563eb', '#60a5fa'),
    currentStock: stock(28, 'In Stock', 'success'),
    price: 420,
    actions: actions(
      { id: 'edit', label: 'Edit', icon: 'edit', tone: 'info' },
      { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' }
    )
  },
  {
    id: 'prd_02',
    product: product('Cloud Lounge Chair', 'SKU CL-087', 'CL', '#1d4ed8', '#38bdf8'),
    currentStock: stock(9, 'Low Stock', 'warning'),
    price: 168,
    actions: actions(
      { id: 'edit', label: 'Edit', icon: 'edit', tone: 'info' },
      { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' }
    )
  },
  {
    id: 'prd_03',
    product: product('Slate Coffee Table', 'SKU ST-312', 'SC', '#0f172a', '#475569'),
    currentStock: stock(0, 'Out of Stock', 'danger'),
    price: 235,
    actions: actions(
      { id: 'edit', label: 'Edit', icon: 'edit', tone: 'info' },
      { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' }
    )
  },
  {
    id: 'prd_04',
    product: product('Arc Floor Lamp', 'SKU AF-155', 'AL', '#1e40af', '#93c5fd'),
    currentStock: stock(41, 'In Stock', 'success'),
    price: 132,
    actions: actions(
      { id: 'edit', label: 'Edit', icon: 'edit', tone: 'info' },
      { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' }
    )
  },
  {
    id: 'prd_05',
    product: product('Pebble Ceramic Set', 'SKU PC-491', 'PC', '#3b82f6', '#bfdbfe'),
    currentStock: stock(15, 'In Stock', 'success'),
    price: 88,
    actions: actions(
      { id: 'edit', label: 'Edit', icon: 'edit', tone: 'info' },
      { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' }
    )
  }
];

const sellerOverviewResponse: ApiResponse<SellerOverviewData> = {
  success: true,
  timestamp: '2026-04-17T10:00:00Z',
  data: {
    pageTitle: 'Seller Dashboard',
    summary: 'Track earnings, stay on top of stock health, and keep your order queue moving with confidence.',
    financials: [
      {
        id: 'earnings',
        label: 'Current Month Earnings',
        value: '$36,420',
        helperText: 'net after fees',
        icon: 'savings',
        trend: 14.8,
        trendDirection: 'up',
        tone: 'success'
      },
      {
        id: 'payouts',
        label: 'Pending Payouts',
        value: '$8,940',
        helperText: 'scheduled for Friday',
        icon: 'account_balance_wallet',
        trend: 3.5,
        trendDirection: 'up',
        tone: 'info'
      }
    ],
    inventory: currencyTable(
      'Product Inventory',
      'Your live catalog with stock state monitoring and quick edit actions.',
      sellerInventoryRows,
      'Add New Product',
      'add_circle'
    ),
    orderQueue: [
      {
        id: '#5102',
        customer: 'Harper West',
        total: '$248',
        fulfillmentStatus: 'Pack for dispatch',
        fulfillmentTone: 'warning',
        eta: 'Today, 4:30 PM',
        destination: 'Cairo, EG'
      },
      {
        id: '#5101',
        customer: 'Jonah Reed',
        total: '$132',
        fulfillmentStatus: 'Ready to ship',
        fulfillmentTone: 'info',
        eta: 'Today, 2:15 PM',
        destination: 'Giza, EG'
      },
      {
        id: '#5098',
        customer: 'Mia Brooks',
        total: '$88',
        fulfillmentStatus: 'Delivered',
        fulfillmentTone: 'success',
        eta: 'Completed',
        destination: 'Alexandria, EG'
      },
      {
        id: '#5095',
        customer: 'Leo Price',
        total: '$420',
        fulfillmentStatus: 'Payment review',
        fulfillmentTone: 'danger',
        eta: 'Awaiting confirmation',
        destination: 'Mansoura, EG'
      }
    ]
  }
};

const loyaltyBase: LoyaltySummary = {
  pointsBalance: 12480,
  pointsLabel: '12,480 points',
  tier: 'Gold',
  nextTier: 'Platinum',
  progress: 72,
  pointsToNextTier: 4520,
  tierBenefits: ['Priority support access', 'Exclusive seasonal offers', 'Early access to premium drops']
};

const marketingSettings: EngagementSetting[] = [
  {
    id: 'notifications',
    label: 'Enable Notifications',
    description: 'Receive product alerts, flash offers, and reward reminders.',
    enabled: true
  },
  {
    id: 'newsletter',
    label: 'Subscribe to Newsletter',
    description: 'Get loyalty news, seller highlights, and launch previews.',
    enabled: true
  }
];

const referralBase: ReferralPanelData = {
  referralCode: 'YALLA-GOLD-24',
  referralLink: 'https://yalla.shop/r/YALLA-GOLD-24',
  message: 'Share your referral link to unlock bonus points when friends place their first order.',
  channels: [
    { id: 'facebook', label: 'Facebook', shortLabel: 'f', accent: '#1d4ed8' },
    { id: 'instagram', label: 'Instagram', shortLabel: 'ig', accent: '#ec4899' },
    { id: 'x', label: 'X', shortLabel: 'x', accent: '#0f172a' }
  ]
};

const marketingOverviewResponse: ApiResponse<MarketingOverviewData> = {
  success: true,
  timestamp: '2026-04-17T10:00:00Z',
  data: {
    pageTitle: 'Marketing & Loyalty',
    summary: 'Keep engagement high with a live rewards balance, tier progress, referrals, and audience communication controls.',
    loyalty: loyaltyBase,
    settings: marketingSettings,
    referral: referralBase
  }
};

const categoryCardsAdmin: DashboardCollectionCard[] = [
  {
    id: 'cat_home',
    title: 'Home Decor',
    metric: '142 products',
    description: 'Fastest-growing category with strong repeat purchases.',
    icon: 'chair',
    tone: 'info'
  },
  {
    id: 'cat_beauty',
    title: 'Beauty',
    metric: '84 products',
    description: 'High-margin launches with strong banner conversion.',
    icon: 'spa',
    tone: 'success'
  },
  {
    id: 'cat_fashion',
    title: 'Fashion',
    metric: '231 products',
    description: 'Broad assortment with the largest pending review queue.',
    icon: 'checkroom',
    tone: 'warning'
  }
];

const pendingApprovalRows: DashboardTableRow[] = [
  {
    id: 'apr_01',
    product: product('Velvet Storage Bench', 'Seller: Studio North', 'VS', '#2563eb', '#7dd3fc'),
    submittedAt: 'Today, 09:15',
    status: status('Pending', 'warning'),
    actions: actions(
      { id: 'approve', label: 'Approve', icon: 'check_circle', tone: 'success' },
      { id: 'reject', label: 'Reject', icon: 'cancel', tone: 'danger' }
    )
  },
  {
    id: 'apr_02',
    product: product('Minimal Wall Shelf', 'Seller: Form Lab', 'MW', '#1d4ed8', '#93c5fd'),
    submittedAt: 'Today, 08:40',
    status: status('Pending', 'warning'),
    actions: actions(
      { id: 'approve', label: 'Approve', icon: 'check_circle', tone: 'success' },
      { id: 'reject', label: 'Reject', icon: 'cancel', tone: 'danger' }
    )
  },
  {
    id: 'apr_03',
    product: product('Contour Vase Duo', 'Seller: Atelier Pure', 'CV', '#0f172a', '#64748b'),
    submittedAt: 'Yesterday',
    status: status('Reviewing', 'info'),
    actions: actions(
      { id: 'approve', label: 'Approve', icon: 'check_circle', tone: 'success' },
      { id: 'reject', label: 'Reject', icon: 'cancel', tone: 'danger' }
    )
  }
];

const shippingRows: DashboardTableRow[] = [
  {
    id: 'shp_01',
    orderId: '#1005',
    carrier: 'DHL Express',
    eta: 'Today, 6 PM',
    status: status('Out for delivery', 'info')
  },
  {
    id: 'shp_02',
    orderId: '#1002',
    carrier: 'Aramex',
    eta: 'Tomorrow',
    status: status('Packed', 'warning')
  },
  {
    id: 'shp_03',
    orderId: '#0998',
    carrier: 'Bosta',
    eta: 'Delivered',
    status: status('Delivered', 'success')
  },
  {
    id: 'shp_04',
    orderId: '#0993',
    carrier: 'Aramex',
    eta: 'Delayed',
    status: status('Issue detected', 'danger')
  }
];

const pageRows: DashboardTableRow[] = [
  {
    id: 'pg_01',
    title: 'Summer Collection Landing',
    owner: 'Growth Team',
    updated: '2 hours ago',
    status: status('Published', 'success'),
    actions: actions(
      { id: 'edit', label: 'Edit', icon: 'edit', tone: 'info' },
      { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' }
    )
  },
  {
    id: 'pg_02',
    title: 'Brand Story',
    owner: 'Content Team',
    updated: 'Yesterday',
    status: status('Published', 'success'),
    actions: actions(
      { id: 'edit', label: 'Edit', icon: 'edit', tone: 'info' },
      { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' }
    )
  },
  {
    id: 'pg_03',
    title: 'Loyalty Program Terms',
    owner: 'Marketing Team',
    updated: '3 days ago',
    status: status('Draft', 'warning'),
    actions: actions(
      { id: 'edit', label: 'Edit', icon: 'edit', tone: 'info' },
      { id: 'delete', label: 'Delete', icon: 'delete', tone: 'danger' }
    )
  }
];

const workspaceResponses: Record<DashboardMode, Record<WorkspacePageKey, ApiResponse<WorkspacePageData>>> = {
  admin: {
    categories: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'categories',
        title: 'Category Performance',
        description: 'A quick view of the marketplace categories driving assortment breadth and conversions.',
        heroMetric: '12 categories',
        heroLabel: 'currently merchandised',
        collectionCards: categoryCardsAdmin,
        chart: {
          title: 'Category Revenue Mix',
          subtitle: 'Static mock chart showing share by category.',
          summaryValue: '61%',
          summaryLabel: 'home and fashion contribution',
          chartType: 'bar',
          points: [
            { label: 'Home', value: 61 },
            { label: 'Beauty', value: 39 },
            { label: 'Fashion', value: 74 },
            { label: 'Wellness', value: 42 },
            { label: 'Tech', value: 33 }
          ]
        }
      }
    },
    inventory: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'inventory',
        title: 'Inventory Monitoring',
        description: 'Marketplace-wide stock visibility for top sellers and hero SKUs.',
        table: currencyTable('Marketplace Inventory', 'Cross-seller stock visibility with action hooks for future API wiring.', sellerInventoryRows)
      }
    },
    'pending-approvals': {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'pending-approvals',
        title: 'Pending Product Approvals',
        description: 'Review new submissions before they go live to customers.',
        table: {
          title: 'Approval Queue',
          description: 'Approve or reject product submissions using static mock payloads.',
          pageSize: 4,
          columns: [
            { key: 'product', label: 'Product', type: 'product', sortable: true },
            { key: 'submittedAt', label: 'Submitted', type: 'text', sortable: true },
            { key: 'status', label: 'Status', type: 'status', sortable: true },
            { key: 'actions', label: 'Actions', type: 'actions', align: 'right' }
          ],
          rows: pendingApprovalRows
        }
      }
    },
    shipping: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'shipping',
        title: 'Shipping Operations',
        description: 'Track delivery progress and exceptions across the fulfillment pipeline.',
        table: {
          title: 'Shipping Status',
          description: 'Latest shipping updates for active orders.',
          pageSize: 4,
          columns: [
            { key: 'orderId', label: 'Order ID', type: 'text', sortable: true },
            { key: 'carrier', label: 'Carrier', type: 'text', sortable: true },
            { key: 'eta', label: 'ETA', type: 'text', sortable: true },
            { key: 'status', label: 'Status', type: 'status', sortable: true }
          ],
          rows: shippingRows
        }
      }
    },
    banners: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'banners',
        title: 'Banner Library',
        description: 'Manage promotional placements and upload new campaign visuals.',
        banners: adminOverviewResponse.data.banners
      }
    },
    pages: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'pages',
        title: 'Content Pages',
        description: 'Keep editorial and campaign pages tidy and ready to publish.',
        table: {
          title: 'Published Pages',
          description: 'A clean content management snapshot for storefront pages.',
          pageSize: 4,
          primaryActionLabel: 'Add Page',
          primaryActionIcon: 'post_add',
          columns: [
            { key: 'title', label: 'Page Title', type: 'text', sortable: true },
            { key: 'owner', label: 'Owner', type: 'text', sortable: true },
            { key: 'updated', label: 'Last Updated', type: 'text', sortable: true },
            { key: 'status', label: 'Status', type: 'status', sortable: true },
            { key: 'actions', label: 'Actions', type: 'actions', align: 'right' }
          ],
          rows: pageRows
        }
      }
    },
    marketing: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'marketing',
        title: 'Marketing Control Center',
        description: 'Retention-focused controls, rewards, and referral momentum from one page.',
        loyalty: loyaltyBase,
        settings: marketingSettings,
        referral: referralBase
      }
    }
  },
  seller: {
    categories: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'categories',
        title: 'Catalog Categories',
        description: 'See which storefront categories are driving the strongest sell-through.',
        collectionCards: [
          {
            id: 'seller_cat_1',
            title: 'Desk Essentials',
            metric: '38 active SKUs',
            description: 'Strong conversion with repeat office shoppers.',
            icon: 'desk',
            tone: 'info'
          },
          {
            id: 'seller_cat_2',
            title: 'Accent Lighting',
            metric: '12 active SKUs',
            description: 'Best click-through from campaign traffic this month.',
            icon: 'light',
            tone: 'success'
          },
          {
            id: 'seller_cat_3',
            title: 'Textured Decor',
            metric: '21 active SKUs',
            description: 'Good average order value but needs stock balancing.',
            icon: 'diamond',
            tone: 'warning'
          }
        ]
      }
    },
    inventory: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'inventory',
        title: 'Inventory Table',
        description: 'Full seller inventory with stock states and action buttons.',
        table: currencyTable(
          'Seller Inventory',
          'Same mock structure as the overview table, ready for future API binding.',
          sellerInventoryRows,
          'Add New Product',
          'add_circle'
        )
      }
    },
    'pending-approvals': {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'pending-approvals',
        title: 'Approval Status',
        description: 'Track which of your submitted products still need admin review.',
        table: {
          title: 'Submitted Products',
          description: 'A seller-side view of approval progress.',
          pageSize: 4,
          columns: [
            { key: 'product', label: 'Product', type: 'product', sortable: true },
            { key: 'submittedAt', label: 'Submitted', type: 'text', sortable: true },
            { key: 'status', label: 'Status', type: 'status', sortable: true }
          ],
          rows: pendingApprovalRows
        }
      }
    },
    shipping: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'shipping',
        title: 'Seller Shipping Queue',
        description: 'Stay ahead of deliveries and delayed shipments.',
        table: {
          title: 'Shipping Updates',
          description: 'Shipment status for your store orders.',
          pageSize: 4,
          columns: [
            { key: 'orderId', label: 'Order ID', type: 'text', sortable: true },
            { key: 'carrier', label: 'Carrier', type: 'text', sortable: true },
            { key: 'eta', label: 'ETA', type: 'text', sortable: true },
            { key: 'status', label: 'Status', type: 'status', sortable: true }
          ],
          rows: shippingRows
        }
      }
    },
    banners: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'banners',
        title: 'Campaign Banners',
        description: 'Seller-owned promotional banners for category and product highlights.',
        banners: adminOverviewResponse.data.banners
      }
    },
    pages: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'pages',
        title: 'Store Content Pages',
        description: 'Manage branded pages and editorial content for your storefront.',
        table: {
          title: 'Storefront Pages',
          description: 'Seller-managed pages with status and edit actions.',
          pageSize: 4,
          primaryActionLabel: 'Add Page',
          primaryActionIcon: 'post_add',
          columns: [
            { key: 'title', label: 'Page Title', type: 'text', sortable: true },
            { key: 'owner', label: 'Owner', type: 'text', sortable: true },
            { key: 'updated', label: 'Last Updated', type: 'text', sortable: true },
            { key: 'status', label: 'Status', type: 'status', sortable: true },
            { key: 'actions', label: 'Actions', type: 'actions', align: 'right' }
          ],
          rows: pageRows
        }
      }
    },
    marketing: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'marketing',
        title: 'Seller Marketing',
        description: 'Use loyalty perks and referral tools to keep returning customers engaged.',
        loyalty: loyaltyBase,
        settings: marketingSettings,
        referral: referralBase
      }
    }
  },
  marketing: {
    categories: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'categories',
        title: 'Audience Categories',
        description: 'Segment customers by the catalog categories they respond to most.',
        collectionCards: [
          {
            id: 'mkt_cat_1',
            title: 'VIP Home Lovers',
            metric: '4.8K members',
            description: 'Highest open rate across campaign sends.',
            icon: 'favorite',
            tone: 'success'
          },
          {
            id: 'mkt_cat_2',
            title: 'Beauty Repeat Buyers',
            metric: '2.1K members',
            description: 'Strong loyalty redemption behavior.',
            icon: 'auto_awesome',
            tone: 'info'
          },
          {
            id: 'mkt_cat_3',
            title: 'Dormant Fashion Shoppers',
            metric: '1.4K members',
            description: 'Ideal target for reactivation and referral pushes.',
            icon: 'bolt',
            tone: 'warning'
          }
        ]
      }
    },
    inventory: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'inventory',
        title: 'Reward Inventory',
        description: 'Preview the current reward catalog promoted in loyalty redemptions.',
        table: currencyTable(
          'Reward Catalog',
          'Static reward items shaped like a future campaign inventory endpoint.',
          sellerInventoryRows
        )
      }
    },
    'pending-approvals': {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'pending-approvals',
        title: 'Campaign Approval Queue',
        description: 'See which campaign assets still need sign-off before launch.',
        table: {
          title: 'Pending Campaign Assets',
          description: 'Marketing approval queue with action hooks.',
          pageSize: 4,
          columns: [
            { key: 'product', label: 'Asset', type: 'product', sortable: true },
            { key: 'submittedAt', label: 'Submitted', type: 'text', sortable: true },
            { key: 'status', label: 'Status', type: 'status', sortable: true },
            { key: 'actions', label: 'Actions', type: 'actions', align: 'right' }
          ],
          rows: pendingApprovalRows
        }
      }
    },
    shipping: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'shipping',
        title: 'Referral Delivery Status',
        description: 'Keep track of reward shipments and fulfillment timing for loyalty perks.',
        table: {
          title: 'Reward Shipment Status',
          description: 'Mock reward shipping updates.',
          pageSize: 4,
          columns: [
            { key: 'orderId', label: 'Reward ID', type: 'text', sortable: true },
            { key: 'carrier', label: 'Carrier', type: 'text', sortable: true },
            { key: 'eta', label: 'ETA', type: 'text', sortable: true },
            { key: 'status', label: 'Status', type: 'status', sortable: true }
          ],
          rows: shippingRows
        }
      }
    },
    banners: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'banners',
        title: 'Campaign Banner Assets',
        description: 'Upload and review loyalty and referral campaign banners.',
        banners: adminOverviewResponse.data.banners
      }
    },
    pages: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'pages',
        title: 'Campaign Pages',
        description: 'Track marketing landing pages and program terms content.',
        table: {
          title: 'Campaign Pages',
          description: 'Content pages used by campaigns and loyalty journeys.',
          pageSize: 4,
          primaryActionLabel: 'Add Page',
          primaryActionIcon: 'post_add',
          columns: [
            { key: 'title', label: 'Page Title', type: 'text', sortable: true },
            { key: 'owner', label: 'Owner', type: 'text', sortable: true },
            { key: 'updated', label: 'Last Updated', type: 'text', sortable: true },
            { key: 'status', label: 'Status', type: 'status', sortable: true },
            { key: 'actions', label: 'Actions', type: 'actions', align: 'right' }
          ],
          rows: pageRows
        }
      }
    },
    marketing: {
      success: true,
      timestamp: '2026-04-17T10:00:00Z',
      data: {
        pageKey: 'marketing',
        title: 'Loyalty Hub',
        description: 'Everything needed to manage points, referrals, and engagement switches.',
        loyalty: loyaltyBase,
        settings: marketingSettings,
        referral: referralBase
      }
    }
  }
};

export function coerceDashboardMode(mode: string | null): DashboardMode {
  if (mode === 'seller' || mode === 'marketing') {
    return mode;
  }

  return 'admin';
}

export function getDashboardShellMock(): ApiResponse<DashboardShellData> {
  return deepClone(shellResponse);
}

export function getAdminOverviewMock(): ApiResponse<AdminOverviewData> {
  return deepClone(adminOverviewResponse);
}

export function getSellerOverviewMock(): ApiResponse<SellerOverviewData> {
  return deepClone(sellerOverviewResponse);
}

export function getMarketingOverviewMock(): ApiResponse<MarketingOverviewData> {
  return deepClone(marketingOverviewResponse);
}

export function getWorkspaceMock(mode: DashboardMode, pageKey: WorkspacePageKey): ApiResponse<WorkspacePageData> {
  return deepClone(workspaceResponses[mode][pageKey]);
}

