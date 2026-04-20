import { Component, OnInit } from '@angular/core';
import { SellerSettingsService } from '../../services/seller-settings.service';
import { ProductService } from '../../../product/services/product.service';
import { formatHttpError } from '../../../../core/utils/http-error.util';
import { Product, ProductStatus } from '../../../product/models/product.model';

@Component({
  selector: 'app-seller-overview',
  templateUrl: './seller-overview.component.html',
  styleUrl: './seller-overview.component.css'
})
export class SellerOverviewComponent implements OnInit {
  products: Product[] = [];
  productCount: number | null = null;
  acceptedCount = 0;
  pendingCount = 0;
  rejectedCount = 0;
  totalRevenue = 0;
  loading = false;
  error: string | null = null;

  constructor(
    private readonly sellerSettings: SellerSettingsService,
    private readonly productService: ProductService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  get sellerId(): number | null {
    return this.sellerSettings.getSellerNumericId();
  }

  refresh(): void {
    const sid = this.sellerSettings.getSellerNumericId();

    // If not cached yet, try auto-resolving first
    if (sid == null) {
      this.loading = true;
      this.sellerSettings.autoResolve().subscribe({
        next: resolvedId => {
          this.loading = false;
          if (resolvedId != null) {
            this.loadProducts(resolvedId);
          } else {
            this.productCount = null;
            this.error = null;
          }
        },
        error: () => {
          this.loading = false;
          this.productCount = null;
        }
      });
      return;
    }

    this.loadProducts(sid);
  }

  private loadProducts(sid: number): void {
    this.loading = true;
    this.error = null;
    this.productService.getProductsForSeller(sid).subscribe({
      next: rows => {
        this.products = rows;
        this.productCount = rows.length;
        this.acceptedCount = rows.filter(p => p.status === ProductStatus.Accepted).length;
        this.pendingCount = rows.filter(p => p.status === ProductStatus.Pending).length;
        this.rejectedCount = rows.filter(p => p.status === ProductStatus.Rejected).length;
        this.totalRevenue = rows.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
        this.loading = false;
      },
      error: err => {
        this.error = formatHttpError(err, 'Could not load your products');
        this.loading = false;
        this.productCount = null;
      }
    });
  }
}
