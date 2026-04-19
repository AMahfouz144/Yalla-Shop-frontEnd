import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmChangeEmail } from '../../../../core/models/confirm-change-email';
import { ProfileServiceService } from '../../../../core/services/profile-service.service';

@Component({
  selector: 'app-confirm-change-email',
  templateUrl: './confirm-change-email.component.html',
  styleUrl: './confirm-change-email.component.css'
})
export class ConfirmChangeEmailComponent implements OnInit {
  private readonly processedRequestStorageKey = 'processedConfirmChangeEmailRequests';
  isLoading = true;
  isSuccess = false;
  message = 'Confirming your email change...';

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileServiceService
  ) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const newEmail = this.route.snapshot.queryParamMap.get('email');
    const code = this.route.snapshot.queryParamMap.get('code');

    if (!userId || !newEmail || !code) {
      this.isLoading = false;
      this.isSuccess = false;
      this.message = 'The confirmation link is incomplete. Please request a new email change link.';
      return;
    }

    const requestKey = `${userId}|${newEmail}|${code}`;
    if (this.hasProcessedRequest(requestKey)) {
      this.isLoading = false;
      this.isSuccess = true;
      this.message = 'This confirmation link has already been processed.';
      return;
    }
    this.markRequestAsProcessed(requestKey);

    const payload: ConfirmChangeEmail = {
      userId,
      newEmail,
      emailChangeToken: code
    };

    this.profileService.confirmChangeEmail(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = response.isSuccess;
        this.message = response.message || (response.isSuccess
          ? 'Your email has been changed successfully.'
          : 'Unable to confirm email change.');
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.message = err?.error?.message || err?.error?.Message || 'Something went wrong while confirming your email change.';
      }
    });
  }

  private getProcessedRequests(): string[] {
    const rawValue = sessionStorage.getItem(this.processedRequestStorageKey);
    if (!rawValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private hasProcessedRequest(requestKey: string): boolean {
    return this.getProcessedRequests().includes(requestKey);
  }

  private markRequestAsProcessed(requestKey: string): void {
    const processedRequests = this.getProcessedRequests();
    if (processedRequests.includes(requestKey)) {
      return;
    }

    processedRequests.push(requestKey);
    sessionStorage.setItem(this.processedRequestStorageKey, JSON.stringify(processedRequests));
  }
}
