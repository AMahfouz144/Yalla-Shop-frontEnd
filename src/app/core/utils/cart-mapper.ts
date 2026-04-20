import { CartItem, CartSummary } from '../models/cart.model';
import { API_ORIGIN } from '../config/api-base';

const FIXED_SHIPPING_COST = 50;

function pick(raw: any, ...keys: string[]): any {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) {
      return raw[key];
    }
  }
  return null;
}

function coerceNum(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Resolve image URL - prepend API origin if it's a relative path */
function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  const s = String(url).trim().replace(/\\/g, '/');
  if (!s) return '';
  // Already absolute
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:') || s.startsWith('blob:')) {
    return s;
  }
  // Relative path - prepend API origin
  const path = s.startsWith('/') ? s : `/${s}`;
  return `${API_ORIGIN}${path}`;
}

export function mapCartItem(raw: any): CartItem {
  const nestedProduct = pick(raw, 'product', 'Product') || {};
  const rawImageUrl = pick(
    raw,
    'imageUrl',
    'ImageUrl',
    'productImageUrl',
    'ProductImageUrl',
    'image',
    'Image',
    'picture',
    'Picture'
  ) ?? pick(
    nestedProduct,
    'imageUrl',
    'ImageUrl',
    'productImageUrl',
    'ProductImageUrl',
    'image',
    'Image',
    'picture',
    'Picture'
  );
  return {
    id: String(pick(raw, 'id', 'Id') || ''),
    productId: String(pick(raw, 'productId', 'ProductId') || ''),
    name: String(pick(raw, 'name', 'Name', 'productName', 'ProductName') || ''),
    imageUrl: resolveImageUrl(rawImageUrl),
    unitPrice: coerceNum(pick(raw, 'unitPrice', 'UnitPrice', 'price', 'Price')),
    quantity: coerceNum(pick(raw, 'quantity', 'Quantity'), 1),
    totalPrice: coerceNum(pick(raw, 'totalPrice', 'TotalPrice', 'lineTotal', 'LineTotal')),
    isInStock: Boolean(pick(raw, 'isInStock', 'IsInStock') ?? true)
  };
}

export function mapCartSummary(raw: any): CartSummary {
  if (!raw) {
    return {
      id: '',
      userId: '',
      items: [],
      itemsCount: 0,
      subTotal: 0,
      shippingCost: FIXED_SHIPPING_COST,
      discount: 0,
      totalAmount: FIXED_SHIPPING_COST,
    };
  }

  // If raw is an array, it likely IS the list of items
  const rawItems = Array.isArray(raw)
    ? raw
    : (pick(raw, 'items', 'Items', 'cartItems', 'CartItems', 'lineItems', 'LineItems') || []);

  const items = Array.isArray(rawItems) ? rawItems.map(mapCartItem) : [];

  // Recalculate totalPrice for items if missing
  items.forEach(item => {
    if (item.totalPrice === 0 && item.unitPrice > 0) {
      item.totalPrice = item.unitPrice * item.quantity;
    }
  });

  // If it was an array, we estimate the summary fields
  if (Array.isArray(raw)) {
    const subTotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    return {
      id: '',
      userId: '',
      items,
      itemsCount: items.length,
      subTotal,
      shippingCost: FIXED_SHIPPING_COST,
      discount: 0,
      totalAmount: subTotal + FIXED_SHIPPING_COST,
    };
  }

  const subTotal = coerceNum(pick(raw, 'subTotal', 'SubTotal', 'subtotal'));
  const discount = coerceNum(pick(raw, 'discount', 'Discount'));

  // Calculate subTotal from items if API returns 0
  const computedSubTotal = subTotal > 0 ? subTotal : items.reduce((sum, i) => sum + i.totalPrice, 0);

  // Always use fixed shipping cost of 50 EGP
  const totalAmount = Math.max(0, (computedSubTotal + FIXED_SHIPPING_COST) - discount);

  return {
    id: String(pick(raw, 'id', 'Id') || ''),
    userId: String(pick(raw, 'userId', 'UserId') || ''),
    items,
    itemsCount: coerceNum(pick(raw, 'itemsCount', 'ItemsCount')) || items.length,
    subTotal: computedSubTotal,
    shippingCost: FIXED_SHIPPING_COST,
    discount,
    totalAmount,
    promoCodeApplied: pick(raw, 'promoCodeApplied', 'PromoCodeApplied')
  };
}
