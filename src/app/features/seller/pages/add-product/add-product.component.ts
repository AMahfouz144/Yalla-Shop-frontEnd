import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../../../core/models/category.model';
import { CategoryService } from '../../../../core/services/category.service';
import { SellerSettingsService } from '../../services/seller-settings.service';
import { formatHttpError } from '../../../../core/utils/http-error.util';
import { ProductStatus } from '../../../product/models/product.model';
import { ProductService } from '../../../product/services/product.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {
  @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;

  readonly ProductStatus = ProductStatus;
  readonly statusOptions = [
    { value: ProductStatus.Pending, label: 'Pending' },
    { value: ProductStatus.Accepted, label: 'Accepted' },
    { value: ProductStatus.Rejected, label: 'Rejected' }
  ];

  categories: Category[] = [];
  loadingCategories = false;
  loadingProduct = false;
  submitting = false;
  error: string | null = null;
  success: string | null = null;

  mode: 'create' | 'edit' = 'create';
  editProductId: number | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    stockQuantity: [null as number | null, [Validators.required, Validators.min(0)]],
    categoryId: [null as number | null, [Validators.required]],
    status: [ProductStatus.Pending]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
    private readonly sellerSettings: SellerSettingsService
  ) { }

  ngOnInit(): void {
    this.mode = this.route.snapshot.data['mode'] === 'edit' ? 'edit' : 'create';
    const idRaw = this.route.snapshot.paramMap.get('id');
    const id = idRaw ? Number(idRaw) : NaN;
    this.editProductId = this.mode === 'edit' && Number.isFinite(id) && id > 0 ? id : null;

    // Auto-resolve seller ID if needed
    if (this.sellerSettings.getSellerNumericId() == null) {
      this.sellerSettings.autoResolve().subscribe();
    }

    this.loadingCategories = true;
    this.categoryService.getAll().subscribe({
      next: c => {
        this.categories = Array.isArray(c) ? c : [];
        this.loadingCategories = false;
        this.afterCategoriesLoaded();
      },
      error: err => {
        this.error = formatHttpError(err, 'Could not load categories');
        this.loadingCategories = false;
      }
    });
  }

  private afterCategoriesLoaded(): void {
    if (this.mode !== 'edit' || this.editProductId == null) {
      return;
    }
    this.loadingProduct = true;
    this.productService.getById(this.editProductId).subscribe({
      next: p => {
        this.form.patchValue({
          name: p.name,
          description: p.description,
          price: p.price,
          stockQuantity: p.stockQuantity,
          categoryId: p.categoryId,
          status: p.status
        });
        this.loadingProduct = false;
      },
      error: err => {
        this.error = formatHttpError(err, 'Could not load product');
        this.loadingProduct = false;
      }
    });
  }

  get pageTitle(): string {
    return this.mode === 'edit' ? 'Edit product' : 'Add product';
  }

  get sellerId(): number | null {
    return this.sellerSettings.getSellerNumericId();
  }

  submit(): void {
    if (this.submitting) {
      return;
    }
    this.form.markAllAsTouched();
    if (this.form.invalid || this.sellerId == null) {
      if (this.sellerId == null) {
        this.error = 'Could not determine your seller account. Please try logging in again.';
      }
      return;
    }

    const file = this.imageInput?.nativeElement?.files?.[0];
    if (this.mode === 'create' && !file) {
      this.error = 'Please choose a product image.';
      return;
    }

    this.submitting = true;
    this.error = null;
    this.success = null;

    const v = this.form.getRawValue();
    const fd = new FormData();
    if (this.mode === 'edit' && this.editProductId != null) {
      fd.append('Id', String(this.editProductId));
      fd.append('Status', String(v.status ?? ProductStatus.Pending));
    }
    fd.append('Name', String(v.name ?? '').trim());
    fd.append('Description', String(v.description ?? ''));
    fd.append('Price', String(v.price));
    fd.append('StockQuantity', String(v.stockQuantity));
    fd.append('CategoryId', String(v.categoryId));
    fd.append('SellerId', String(this.sellerId));
    if (file) {
      fd.append('Image', file, file.name);
    }

    const req$ =
      this.mode === 'edit' && this.editProductId != null
        ? this.productService.updateFromForm(this.editProductId, fd)
        : this.productService.createFromForm(fd);

    req$.subscribe({
      next: product => {
        this.submitting = false;
        this.success = this.mode === 'edit' ? 'Product updated.' : 'Product created.';
        if (product.sellerId != null && product.sellerId > 0) {
          this.sellerSettings.setSellerNumericId(product.sellerId);
        }
        this.router.navigate(['/seller/products']);
      },
      error: err => {
        this.submitting = false;
        this.error = formatHttpError(err, 'Save failed');
      }
    });
  }
}
