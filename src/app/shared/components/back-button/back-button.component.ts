import { Component, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.css'
})
export class BackButtonComponent {

  constructor(
    private location: Location,
    private router: Router
  ) {}

  @HostListener('window:keydown.alt.ArrowLeft', ['$event'])
  onAltLeftArrow(event: KeyboardEvent) {
    event.preventDefault();
    this.goBack();
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      this.location.back();
    } else {
      void this.router.navigate(['/home']);
    }
  }
}
