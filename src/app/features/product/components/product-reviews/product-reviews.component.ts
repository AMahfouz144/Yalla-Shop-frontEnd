import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ResponseModel } from '../../../../core/Interfaces/response-model';
import { ReviewResponse } from '../../../../core/Interfaces/review-response';
import { AuthService } from '../../../../core/services/auth.service';
import { ReviewsService } from '../../../../core/services/reviews.service';
import { formatHttpError } from '../../../../core/utils/http-error.util';

const NO_REVIEWS_MESSAGE = 'No Reviews';

type StarKind = 'full' | 'half' | 'empty';

function clampRating(r: number): number {
  if (!Number.isFinite(r)) {
    return 0;
  }
  return Math.max(0, Math.min(5, r));
}

function getStars(rating: number): { kind: StarKind }[] {
  const halfStepsTotal = Math.round(clampRating(rating) * 2);
  const stars: { kind: StarKind }[] = [];
  for (let i = 0; i < 5; i++) {
    const slotStart = i * 2;
    const remaining = halfStepsTotal - slotStart;
    if (remaining >= 2) {
      stars.push({ kind: 'full' });
    } else if (remaining === 1) {
      stars.push({ kind: 'half' });
    } else {
      stars.push({ kind: 'empty' });
    }
  }
  return stars;
}

@Component({
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.component.html',
  styleUrls: ['./product-reviews.component.scss']
})
export class ProductReviewsComponent implements OnChanges {
  /** When set, loads reviews and average rating for this product. */
  @Input() productId: number | null = null;

  reviews: ReviewResponse[] = [];
  loading = false;
  listError: string | null = null;

  /** Average from API (`getProductRating`). */
  averageRating: number | null = null;
  averageNoReviews = false;
  averageStars: { kind: StarKind }[] = [];
  ratingError: string | null = null;

  /** Customer + logged in — show Add Review. */
  get canAddReview(): boolean {
    return (
      this.authService.isAuthenticated() &&
      this.authService.hasRole('Customer')
    );
  }

  /** Inline form for add / edit. */
  formOpen = false;
  formRating = 5;
  formComment = '';
  editingReview: ReviewResponse | null = null;
  formSubmitting = false;

  /** Banners */
  successMessage: string | null = null;
  bannerError: string | null = null;

  /** Delete confirmation */
  deleteTarget: ReviewResponse | null = null;
  deleteSubmitting = false;

  readonly starPick = [1, 2, 3, 4, 5];

  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly authService: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['productId']) {
      return;
    }
    const id = this.productId;
    if (id != null && id > 0) {
      this.loadReviewsAndRating();
    } else {
      this.reviews = [];
      this.resetAverageUi();
    }
  }

  currentUserId(): string | null {
    return this.authService.getSessionUser()?.userId ?? null;
  }

  isReviewOwner(r: ReviewResponse): boolean {
    const uid = this.currentUserId();
    if (!uid || !this.authService.hasRole('Customer')) {
      return false;
    }

   


    const reviewUserId = String(r.userId ?? '').trim().toLowerCase();
    const currentUserId = uid.trim().toLowerCase();

     console.log({
      reviewUserId,
    currentUserId,
     equal: reviewUserId === currentUserId,
    role: this.authService.getSessionUser(),
  });
    return reviewUserId === currentUserId;
  }

  openAddForm(): void {
    this.clearBanners();
    this.editingReview = null;
    this.formRating = 5;
    this.formComment = '';
    this.formOpen = true;
  }

  openEditForm(r: ReviewResponse): void {
    this.clearBanners();
    this.editingReview = r;
    this.formRating = Math.round(clampRating(r.rating));
    this.formComment = r.comment ?? '';
    this.formOpen = true;
  }

  closeForm(): void {
    if (this.formSubmitting) {
      return;
    }
    this.formOpen = false;
    this.editingReview = null;
  }

  setFormRating(n: number): void {
    this.formRating = n;
  }

  starsForReview(rating: number): { kind: StarKind }[] {
    return getStars(rating);
  }

  trackByReviewId(_index: number, r: ReviewResponse): number {
    return r.id;
  }

  submitForm(): void {
    const pid = this.productId;
    if (pid == null || pid <= 0) {
      return;
    }

    const user = this.authService.getSessionUser();
    if (!user) {
      this.bannerError = 'Please sign in to submit a review.';
      return;
    }

    this.formSubmitting = true;
    this.clearBanners();

    const commentTrimmed = this.formComment.trim();
    const rating = Math.round(clampRating(this.formRating));

    if (this.editingReview) {
      this.reviewsService
        .updateReview(this.editingReview.id, {
          rating,
          comment: commentTrimmed
        })
        .pipe(
          catchError(err =>
            of({
              isSuccess: false,
              message: formatHttpError(err, 'Unable to update the review at this time.'),
              data: false
            } as ResponseModel<boolean>)
          ),
          finalize(() => (this.formSubmitting = false))
        )
        .subscribe(res => this.handleWriteResponse(res, () => {
          this.successMessage = 'Review updated successfully.';
          this.formOpen = false;
          this.editingReview = null;
          this.loadReviewsAndRating();
        }));
      return;
    }

    this.reviewsService
      .addReview({
        productId: pid,
        rating,
        comment: commentTrimmed
      })
      .pipe(
        catchError(err =>
          of({
            isSuccess: false,
            message: formatHttpError(err, 'Unable to submit your review at this time.'),
            data: null as unknown as ReviewResponse
          } as ResponseModel<ReviewResponse>)
        ),
        finalize(() => (this.formSubmitting = false))
      )
      .subscribe(res =>
        this.handleWriteResponse(res, () => {
          this.successMessage = 'Review Added Successfully';
          this.formOpen = false;
          this.editingReview = null;
          this.formComment = '';
          this.formRating = 5;
          this.loadReviewsAndRating();
        })
      );
  }

  private handleWriteResponse(
    res: ResponseModel<ReviewResponse | boolean>,
    onSuccess: () => void
  ): void {
    if (res.isSuccess) {
      onSuccess();
      return;
    }
    this.bannerError =
      (res.message && res.message.trim()) ||
      'Unable to complete the request. Please try again later.';
  }

  askDelete(r: ReviewResponse): void {
    this.clearBanners();
    this.deleteTarget = r;
  }

  cancelDelete(): void {
    if (this.deleteSubmitting) {
      return;
    }
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    const r = this.deleteTarget;
    if (!r) {
      return;
    }
    this.deleteSubmitting = true;
    this.clearBanners();
    this.reviewsService
      .deleteReview(r.id)
      .pipe(
        catchError(err =>
          of({
            isSuccess: false,
            message: formatHttpError(err, 'Unable to delete the review at this time.'),
            data: false
          } as ResponseModel<boolean>)
        ),
        finalize(() => (this.deleteSubmitting = false))
      )
      .subscribe(res => {
        if (res.isSuccess) {
          this.successMessage = 'Review removed successfully.';
          this.deleteTarget = null;
          this.loadReviewsAndRating();
          return;
        }
        this.bannerError =
          (res.message && res.message.trim()) ||
          'Unable to delete the review. Please try again later.';
      });
  }

  private loadReviewsAndRating(): void {
    const pid = this.productId;
    if (pid == null || pid <= 0) {
      return;
    }

    this.loading = true;
    this.listError = null;
    this.ratingError = null;

    forkJoin({
      reviews: this.reviewsService.getProductReviews(pid).pipe(
        catchError(err =>
          of({
            isSuccess: false,
            message: formatHttpError(err, 'Could not load reviews'),
            data: [] as ReviewResponse[]
          } as ResponseModel<ReviewResponse[]>)
        )
      ),
      rating: this.reviewsService.getProductRating(pid).pipe(
        catchError(err =>
          of({
            isSuccess: false,
            message: formatHttpError(err, 'Could not load rating'),
            data: 0
          } as ResponseModel<number>)
        )
      )
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(({ reviews: revRes, rating: ratingRes }) => {
        if (revRes.isSuccess && Array.isArray(revRes.data)) {
          this.reviews = revRes.data;
        } else {
          this.reviews = [];
          this.listError =
            (revRes.message && revRes.message.trim()) ||
            'Unable to load reviews at this time. Please refresh the page or try again later.';
        }

        const msg = (ratingRes.message ?? '').trim();
        if (msg === NO_REVIEWS_MESSAGE) {
          this.averageNoReviews = true;
          this.averageRating = null;
          this.averageStars = [];
        } else if (ratingRes.isSuccess) {
          this.averageNoReviews = false;
          const avg = clampRating(Number(ratingRes.data));
          this.averageRating = avg;
          this.averageStars = getStars(avg);
        } else {
          this.resetAverageUi();
          this.ratingError =
            (ratingRes.message && ratingRes.message.trim()) ||
            'Unable to load average rating at the moment. Please try again later.';
        }
      });
  }

  private resetAverageUi(): void {
    this.averageNoReviews = false;
    this.averageRating = null;
    this.averageStars = [];
    this.ratingError = null;
  }

  private clearBanners(): void {
    this.successMessage = null;
    this.bannerError = null;
  }
}
