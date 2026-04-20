import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { PromoService } from '../../../../core/services/promo.service';

@Component({
  selector: 'app-create-promo',
  templateUrl: './create-promo.component.html',
  styleUrl: './create-promo.component.css'
})
export class CreatePromoComponent {
  @Output() close = new EventEmitter<void>();

  promoForm: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private promoService: PromoService) {
    this.promoForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      discountType: ['', Validators.required],
      discountValue: [null, [Validators.required, Validators.min(0)]],
      minOrderAmount: [0, [Validators.min(0)]],
      maxUsageCount: [100, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }, { validators: this.dateValidator });
  }

  get formControls() {
    return this.promoForm.controls;
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    const start = control.get('startDate')?.value;
    const end = control.get('endDate')?.value;
    if (start && end && new Date(end) <= new Date(start)) {
      return { dateInvalid: true };
    }
    return null;
  }

  generateRandomCode(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.promoForm.patchValue({ code });
  }

  onSubmit(): void {
    if (this.promoForm.invalid) {
      this.promoForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formValue = this.promoForm.value;

    // Convert local datetime-local string to ISO strings with Z
    const payload = {
      ...formValue,
      code: formValue.code.toUpperCase(),
      startDate: new Date(formValue.startDate).toISOString(),
      endDate: new Date(formValue.endDate).toISOString()
    };

    this.promoService.createPromo(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.isSuccess !== false) {
          this.successMessage = res.message || 'Promo created successfully!';
          this.promoForm.reset({
            minOrderAmount: 0,
            maxUsageCount: 100,
            discountType: ''
          });
          setTimeout(() => this.onClose(), 2000);
        } else {
          this.errorMessage = res.message || 'Failed to create promo.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err.error?.message || err.message || 'An unexpected error occurred.';
        this.errorMessage = msg;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
