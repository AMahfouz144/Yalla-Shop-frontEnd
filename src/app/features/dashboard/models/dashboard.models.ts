export type DashboardMode = 'admin' | 'seller' | 'marketing';
export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type DashboardTableColumnType = 'text' | 'currency' | 'status' | 'product' | 'stock' | 'actions';
export type WorkspacePageKey =
  | 'categories'
  | 'inventory'
  | 'pending-approvals'
  | 'shipping'
  | 'banners'
  | 'pages'
  | 'marketing';

export interface ApiResponse<T> {
  success: boolean;
  timestamp: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface DashboardBrand {
  name: string;
  tagline: string;
}

export interface DashboardModeOption {
  id: DashboardMode;
  label: string;
  description: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  time: string;
  read: boolean;
}

export interface DashboardUserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export interface DashboardNavLink {
  id: string;
  label: string;
  icon: string;
  path?: string[];
  badge?: string;
  children?: DashboardNavLink[];
}

export interface DashboardShellData {
  brand: DashboardBrand;
  searchPlaceholder: string;
  notificationCount: number;
  user: DashboardUserProfile;
  modes: DashboardModeOption[];
  notifications: DashboardNotification[];
  navigation: DashboardNavLink[];
}

export interface StatCardData {
  id: string;
  label: string;
  value: string;
  helperText: string;
  icon: string;
  trend: number;
  trendDirection: 'up' | 'down';
  tone: StatusTone;
}

export interface TableCellProduct {
  imageUrl: string;
  title: string;
  subtitle?: string;
}

export interface TableCellStatus {
  label: string;
  tone: StatusTone;
}

export interface TableCellStock {
  value: number;
  label: string;
  tone: StatusTone;
}

export interface TableAction {
  id: string;
  label: string;
  icon: string;
  tone: StatusTone;
}

export type DashboardTableCellValue =
  | string
  | number
  | TableCellProduct
  | TableCellStatus
  | TableCellStock
  | TableAction[];

export interface DashboardTableRow {
  id: string;
  [key: string]: DashboardTableCellValue;
}

export interface DashboardTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type: DashboardTableColumnType;
  align?: 'left' | 'center' | 'right';
}

export interface DashboardTableData {
  title: string;
  description: string;
  columns: DashboardTableColumn[];
  rows: DashboardTableRow[];
  pageSize?: number;
  primaryActionLabel?: string;
  primaryActionIcon?: string;
  emptyState?: string;
}

export interface DashboardTableActionEvent {
  actionId: string;
  rowId: string;
  row: DashboardTableRow;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartCardData {
  title: string;
  subtitle: string;
  summaryValue: string;
  summaryLabel: string;
  chartType: 'line' | 'bar';
  points: ChartPoint[];
}

export interface BannerItem {
  id: string;
  title: string;
  placement: string;
  summary: string;
  status: TableCellStatus;
  accent: string;
  ctaLabel: string;
}

export interface SellerOrderItem {
  id: string;
  customer: string;
  total: string;
  fulfillmentStatus: string;
  fulfillmentTone: StatusTone;
  eta: string;
  destination: string;
}

export interface LoyaltySummary {
  pointsBalance: number;
  pointsLabel: string;
  tier: string;
  nextTier: string;
  progress: number;
  pointsToNextTier: number;
  tierBenefits: string[];
}

export interface EngagementSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface ReferralChannel {
  id: string;
  label: string;
  shortLabel: string;
  accent: string;
}

export interface ReferralPanelData {
  referralCode: string;
  referralLink: string;
  message: string;
  channels: ReferralChannel[];
}

export interface DashboardCollectionCard {
  id: string;
  title: string;
  metric: string;
  description: string;
  icon: string;
  tone: StatusTone;
}

export interface AdminOverviewData {
  pageTitle: string;
  summary: string;
  stats: StatCardData[];
  recentOrders: DashboardTableData;
  revenue: ChartCardData;
  banners: BannerItem[];
}

export interface SellerOverviewData {
  pageTitle: string;
  summary: string;
  financials: StatCardData[];
  inventory: DashboardTableData;
  orderQueue: SellerOrderItem[];
}

export interface MarketingOverviewData {
  pageTitle: string;
  summary: string;
  loyalty: LoyaltySummary;
  settings: EngagementSetting[];
  referral: ReferralPanelData;
}

export interface WorkspacePageData {
  pageKey: WorkspacePageKey;
  title: string;
  description: string;
  heroMetric?: string;
  heroLabel?: string;
  statCards?: StatCardData[];
  collectionCards?: DashboardCollectionCard[];
  table?: DashboardTableData;
  chart?: ChartCardData;
  banners?: BannerItem[];
  loyalty?: LoyaltySummary;
  settings?: EngagementSetting[];
  referral?: ReferralPanelData;
}

