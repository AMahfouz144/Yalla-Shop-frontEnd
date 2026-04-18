import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';

import { getDashboardShellMock, coerceDashboardMode } from '../../mock/dashboard.mock-data';
import { DashboardMode, DashboardShellData } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-shell',
  templateUrl: './dashboard-shell.component.html',
  styleUrl: './dashboard-shell.component.css'
})
export class DashboardShellComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly shellData: DashboardShellData = getDashboardShellMock().data;
  currentMode: DashboardMode = 'admin';
  currentUrl = '';
  sidebarOpen = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.currentUrl = this.router.url;

    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.currentMode = coerceDashboardMode(params.get('mode'));
        this.sidebarOpen = false;
      });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentUrl = this.router.url;
      });
  }

  onModeChange(mode: DashboardMode): void {
    if (mode === this.currentMode) {
      return;
    }

    this.router.navigate(['/dashboard', mode, 'overview']);
  }

  onToggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onCloseSidebar(): void {
    this.sidebarOpen = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
