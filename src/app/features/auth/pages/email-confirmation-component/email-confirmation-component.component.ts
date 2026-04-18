import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-email-confirmation-component',
  templateUrl: './email-confirmation-component.component.html',
  styleUrl: './email-confirmation-component.component.css'
})
export class EmailConfirmationComponentComponent implements OnInit {
  message: string = '';
  success: boolean = false;
  private isCalled = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (this.isCalled) return;
      this.isCalled = true;
      const userId = params['userId'];
      const code = params['code'];

      if (userId && code) {
        this.confirmEmail(userId, code);
      } else {
        this.message = 'Invalid confirmation link';
      }
    });
  }

  confirmEmail(userId: string, code: string) {
    this.authService.confirmEmail(userId, code).subscribe({
      next: (res) => {
        this.success = res.isSuccess;
        this.message = res.message;
      },
      error: (err) => {
        this.success = false;
        this.message = err.error?.message || 'Something went wrong';
      }
    });
  }
}
