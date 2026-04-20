import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminDashboardSummary } from '../../models/admin.models';
import { AdminDashboardService } from '../../services/admin-dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  summary: AdminDashboardSummary | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.adminDashboardService
      .getDashboardSummary(true)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (summary) => {
          this.summary = summary;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || error?.message || 'Failed to load dashboard overview.';
        }
      });
  }
}
