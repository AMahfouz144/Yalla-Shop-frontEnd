import { Product, ProductStatus } from '../models/product.model';

function pick(raw: Record<string, unknown>, camel: string, pascal: string): unknown {
  const a = raw[camel];
  if (a !== undefined && a !== null) {
    return a;
  }
  return raw[pascal];
}

function coerceNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** API may expose `ImageUrl` (current) or legacy `Picture` / base64. */
function pickPicture(raw: Record<string, unknown>): unknown {
  const keys = ['imageUrl', 'ImageUrl', 'picture', 'Picture'] as const;
  for (const k of keys) {
    const v = raw[k];
    if (v != null && v !== '') {
      return v;
    }
  }
  return null;
}

function normalizePicture(raw: unknown): string | null {
  if (raw == null || raw === '') {
    return null;
  }
  if (typeof raw === 'string') {
    return raw.trim();
  }
  if (Array.isArray(raw)) {
    try {
      const u8 = new Uint8Array(raw as number[]);
      let binary = '';
      u8.forEach(b => {
        binary += String.fromCharCode(b);
      });
      return btoa(binary);
    } catch {
      return null;
    }
  }
  return null;
}

function coerceStatus(raw: unknown): ProductStatus {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw as ProductStatus;
  }
  if (typeof raw === 'string') {
    const byName = ['Pending', 'Accepted', 'Rejected'].indexOf(raw);
    if (byName >= 0) {
      return byName as ProductStatus;
    }
    return coerceNum(raw, 0) as ProductStatus;
  }
  return ProductStatus.Pending;
}

/** Maps API JSON (camelCase or PascalCase) to our Product model. */
export function mapProductDto(raw: Record<string, unknown>): Product {
  const sellerRaw = pick(raw, 'sellerId', 'SellerId');
  const rawPicture = pickPicture(raw);
  const imageUrlStr = typeof rawPicture === 'string' ? rawPicture.trim() : '';
  return {
    id: coerceNum(pick(raw, 'id', 'Id')),
    name: String(pick(raw, 'name', 'Name') ?? ''),
    description: String(pick(raw, 'description', 'Description') ?? ''),
    price: coerceNum(pick(raw, 'price', 'Price')),
    stockQuantity: coerceNum(pick(raw, 'stockQuantity', 'StockQuantity')),
    picture: normalizePicture(rawPicture),
    imageUrl: imageUrlStr,
    status: coerceStatus(pick(raw, 'status', 'Status')),
    categoryId: coerceNum(pick(raw, 'categoryId', 'CategoryId')),
    sellerId: sellerRaw == null || sellerRaw === '' ? null : coerceNum(sellerRaw),
    createdAt: String(pick(raw, 'createdAt', 'CreatedAt') ?? '')
  };
}

export function mapProductList(raw: unknown): Product[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(item => mapProductDto(item as Record<string, unknown>));
}
