import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../product/services/product.service';
import { Product, ProductStatus } from '../../../product/models/product.model';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';
import { formatHttpError } from '../../../../core/utils/http-error.util';
import { API_ORIGIN } from '../../../../core/config/api-base';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  category: Category | null = null;
  loading = true;
  error: string | null = null;
  deleting = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService
  ) { }

  ngOnInit(): void {
    const idRaw = this.route.snapshot.paramMap.get('id');
    const id = idRaw ? Number(idRaw) : NaN;
    if (!Number.isFinite(id) || id <= 0) {
      this.error = 'Invalid product identifier.';
      this.loading = false;
      return;
    }
    this.loadProduct(id);
  }

  private loadProduct(id: number): void {
    this.loading = true;
    this.error = null;
    this.productService.getById(id).subscribe({
      next: product => {
        this.product = product;
        this.loading = false;
        this.loadCategory(product.categoryId);
      },
      error: err => {
        this.error = formatHttpError(err, 'Could not load product');
        this.loading = false;
      }
    });
  }

  private loadCategory(categoryId: number): void {
    if (!categoryId) return;
    this.categoryService.getAll().subscribe({
      next: cats => {
        this.category = (Array.isArray(cats) ? cats : []).find(c => c.id === categoryId) || null;
      }
    });
  }

  getImageUrl(picture: string | null): string | null {
    if (!picture) return null;
    if (picture.startsWith('http://') || picture.startsWith('https://') || picture.startsWith('data:')) {
      return picture;
    }
    return `${API_ORIGIN}/${picture}`;
  }

  edit(): void {
    if (this.product) {
      this.router.navigate(['/seller/products', this.product.id, 'edit']);
    }
  }

  confirmDelete(): void {
    if (!this.product || !confirm(`Delete "${this.product.name}"? This cannot be undone.`)) return;
    this.deleting = true;
    this.productService.delete(this.product.id).subscribe({
      next: () => {
        this.router.navigate(['/seller/products']);
      },
      error: err => {
        this.deleting = false;
        this.error = formatHttpError(err, 'Could not delete product');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/seller/products']);
  }
}
