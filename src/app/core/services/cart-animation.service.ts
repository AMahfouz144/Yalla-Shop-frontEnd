import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartAnimationService {

  constructor() {}

  /**
   * Triggers a fly-to-cart animation matching the event's origin to the fixed navbar cart icon.
   * @param event The mouse event containing clientX/clientY click coordinates.
   * @param imageUrl The URL of the product image to visually fly.
   */
  animateToCart(event: MouseEvent, imageUrl: string): void {
    if (typeof document === 'undefined') return;

    // Get the target cart icon element from the navbar
    const cartIcon = document.getElementById('cartIcon');
    if (!cartIcon) return;

    const cartRect = cartIcon.getBoundingClientRect();
    
    // Create ghost image element
    const ghost = document.createElement('img');
    ghost.src = imageUrl || 'assets/images/placeholder.png';
    ghost.style.position = 'fixed';
    ghost.style.zIndex = '9999';
    ghost.style.left = `${event.clientX - 25}px`;
    ghost.style.top = `${event.clientY - 25}px`;
    ghost.style.width = '50px';
    ghost.style.height = '50px';
    ghost.style.borderRadius = '50%';
    ghost.style.objectFit = 'cover';
    ghost.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    ghost.style.pointerEvents = 'none'; // Prevent blocking other clicks

    document.body.appendChild(ghost);

    // Apply animation frame to ensure the transition computes properly
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ghost.style.left = `${cartRect.left + cartRect.width / 2 - 10}px`;
        ghost.style.top = `${cartRect.top + cartRect.height / 2 - 10}px`;
        ghost.style.width = '20px';
        ghost.style.height = '20px';
        ghost.style.opacity = '0.3';
        ghost.style.transform = 'scale(0.5)';
      });
    });

    // Clean up element after animation (match the transition time)
    setTimeout(() => {
      if (document.body.contains(ghost)) {
        ghost.remove();
      }
    }, 600);
  }
}
