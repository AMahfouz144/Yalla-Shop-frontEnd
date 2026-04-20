import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { WishlistServiceService } from '../../../../core/services/wishlist-service.service';
import { WhislistResponse } from '../../../../core/models/whislist-response';
import { CartService } from '../../../../core/services/cart.service';
import { CartAnimationService } from '../../../../core/services/cart-animation.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlistItems: WhislistResponse[] = [];
  loading = false;
  message = '';
  isError = false;

  constructor(
    private wishlistService: WishlistServiceService,
    private authService: AuthService,
    private cartService: CartService,
    private cartAnimationService: CartAnimationService
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  get token(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem('token');
  }

  get userId(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem('userId');
  }

  loadWishlist(): void {
    if (!this.token || !this.userId) {
      this.showError('You must be logged in to view your wishlist.');
      return;
    }

    this.loading = true;
    this.message = '';

    this.wishlistService.getWishlist(this.token, this.userId).subscribe({
      next: (result) => {
        this.wishlistItems = result.data || [];
        this.loading = false;

        if (result.message) {
          this.showMessage(result.message);
        }

        if (this.wishlistItems.length === 0) {
          this.showMessage('Your wishlist is currently empty. Add favorites to keep them handy.');
        }
      },
      error: (error) => this.handleError(error)
    });
  }

  addToCart(item: WhislistResponse, event: MouseEvent): void {
    event.stopPropagation();
    
    // Animate item to cart
    const imgUrl = item.product.picture || 'assets/images/placeholder.png';
    this.cartAnimationService.animateToCart(event, imgUrl);

    this.loading = true; // Briefly disable buttons
    
    this.cartService.addItem(item.product.id, 1).subscribe({
      next: () => {
        this.showMessage(`Added “${item.product.name}” to cart.`);
        // Remove from wishlist automatically
        this.removeFromWishlist(item, true);
      },
      error: (err: any) => {
        this.handleError(err);
      }
    });
  }

  removeFromWishlist(item: WhislistResponse, silent = false): void {
    if (!this.token) {
      if (!silent) this.showError('Unable to remove item because you are not authenticated.');
      return;
    }

    if (!silent) {
      this.loading = true;
      this.message = '';
    }

    this.wishlistService.removeFromWishlist(this.token, item.product.id).subscribe({
      next: (result) => {
        if (!silent) this.loading = false;
        if (result.isSuccess) {
          this.wishlistItems = this.wishlistItems.filter((entry) => entry.product.id !== item.product.id);
          if (!silent) this.showMessage(result.message || 'Item removed from your wishlist successfully.');
          if (this.wishlistItems.length === 0) {
            this.showMessage('Your wishlist is now empty. Keep browsing to save favorites.');
          }
        } else {
          if (!silent) this.showError(result.message || 'Failed to remove the item from your wishlist.');
        }
      },
      error: (error) => {
        if (!silent) this.handleError(error);
      }
    });
  }

  private showMessage(text: string): void {
    this.isError = false;
    this.message = text;
  }

  private showError(text: string): void {
    this.isError = true;
    this.message = text;
    this.loading = false;
  }

  private handleError(error: unknown): void {
    const message =
      typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string'
        ? (error as any).message
        : 'An unexpected error occurred. Please try again later.';

    this.showError(message);
  }

  trackByWishlistId(_index: number, item: WhislistResponse): number {
    return item.id;
  }
}