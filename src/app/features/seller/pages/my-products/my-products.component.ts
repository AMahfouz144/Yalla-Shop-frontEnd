import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SellerSettingsService } from '../../services/seller-settings.service';
import { Product } from '../../../product/models/product.model';
import { ProductService } from '../../../product/services/product.service';
import { formatHttpError } from '../../../../core/utils/http-error.util';
import { API_ORIGIN } from '../../../../core/config/api-base';

@Component({
  selector: 'app-my-products',
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.css'
})
export class MyProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  deletingId: number | null = null;
  searchTerm = '';

  constructor(
    private readonly sellerSettings: SellerSettingsService,
    private readonly productService: ProductService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get sellerId(): number | null {
    return this.sellerSettings.getSellerNumericId();
  }

  get filteredProducts(): Product[] {
    if (!this.searchTerm.trim()) {
      return this.products;
    }
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(
      p => p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term)
    );
  }

  load(): void {
    const sid = this.sellerSettings.getSellerNumericId();

    // If not cached, try auto-resolving first
    if (sid == null) {
      this.loading = true;
      this.sellerSettings.autoResolve().subscribe({
        next: resolvedId => {
          if (resolvedId != null) {
            this.fetchProducts(resolvedId);
          } else {
            this.loading = false;
            this.products = [];
            this.error = 'Could not determine your seller account. Please contact support.';
          }
        },
        error: () => {
          this.loading = false;
          this.products = [];
          this.error = 'Could not determine your seller account.';
        }
      });
      return;
    }

    this.fetchProducts(sid);
  }

  private fetchProducts(sid: number): void {
    this.loading = true;
    this.error = null;
    this.productService.getProductsForSeller(sid).subscribe({
      next: rows => {
        this.products = rows;
        this.loading = false;
      },
      error: err => {
        this.error = formatHttpError(err, 'Could not load products');
        this.products = [];
        this.loading = false;
      }
    });
  }

  viewDetails(p: Product): void {
    this.router.navigate(['/seller/products', p.id, 'details']);
  }

  edit(p: Product): void {
    this.router.navigate(['/seller/products', p.id, 'edit']);
  }

  add(): void {
    this.router.navigate(['/seller/products/new']);
  }

  deleteProduct(p: Product): void {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) {
      return;
    }
    this.deletingId = p.id;
    this.productService.delete(p.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.load();
      },
      error: err => {
        this.deletingId = null;
        this.error = formatHttpError(err, 'Could not delete product');
      }
    });
  }

  statusLabel(status: number): string {
    return ['Pending', 'Accepted', 'Rejected'][status] ?? String(status);
  }

  getImageUrl(picture: string | null): string | null {
    if (!picture) return null;
    if (picture.startsWith('http://') || picture.startsWith('https://') || picture.startsWith('data:')) {
      return picture;
    }
    return `${API_ORIGIN}/${picture}`;
  }
}
