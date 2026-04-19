import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Yalla-Shop';

  constructor(private readonly router: Router) { }

  get isDashboardLayout(): boolean {
    const url = this.router.url;
    return (
      url.startsWith('/dashboard') ||
      url.startsWith('/admin') ||
      url.startsWith('/seller') ||
      url.startsWith('/marketing')
    );
  }
}
