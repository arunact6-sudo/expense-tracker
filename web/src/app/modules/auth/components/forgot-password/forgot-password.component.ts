import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-forgot-password',
  template: `
    <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="forgot-form">
      <mat-form-field appearance="outline" class="w-full form-field-animated stagger-1">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email" placeholder="Enter your registered email">
        <mat-icon matPrefix>email</mat-icon>
        <mat-error *ngIf="resetForm.get('email')?.hasError('required')">Email is required</mat-error>
        <mat-error *ngIf="resetForm.get('email')?.hasError('email')">Enter a valid email</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full form-field-animated stagger-2">
        <mat-label>Security Question</mat-label>
        <mat-select formControlName="securityQuestion">
          <mat-option value="">Select a question</mat-option>
          <mat-option value="pet">What is your pet's name?</mat-option>
          <mat-option value="school">What school did you attend?</mat-option>
          <mat-option value="city">What city were you born in?</mat-option>
          <mat-option value="color">What is your favorite color?</mat-option>
          <mat-option value="food">What is your favorite food?</mat-option>
        </mat-select>
        <mat-icon matPrefix>security</mat-icon>
        <mat-error>Select a question</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full form-field-animated stagger-3">
        <mat-label>Security Answer</mat-label>
        <input matInput formControlName="securityAnswer" placeholder="Your answer">
        <mat-icon matPrefix>question_answer</mat-icon>
        <mat-error>Answer is required</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full form-field-animated stagger-4">
        <mat-label>New Password</mat-label>
        <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="newPassword">
        <mat-icon matPrefix>lock</mat-icon>
        <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword" class="visibility-toggle">
          <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        <mat-error *ngIf="resetForm.get('newPassword')?.hasError('required')">New password is required</mat-error>
        <mat-error *ngIf="resetForm.get('newPassword')?.hasError('minlength')">Minimum 6 characters</mat-error>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" class="w-full submit-btn stagger-5"
        [disabled]="loading" [class.loading]="loading">
        <mat-spinner *ngIf="loading" diameter="20" class="btn-spinner"></mat-spinner>
        <span *ngIf="!loading" class="btn-text">Reset Password</span>
      </button>

      <div class="auth-link">
        Remember your password? <a routerLink="/auth/login">Login</a>
      </div>
    </form>
  `,
  styles: [`
    .w-full { width: 100%; }

    .forgot-form {
      animation: fadeInUp 0.5s ease;
    }

    .form-field-animated {
      animation: fadeInUp 0.5s ease forwards;
      opacity: 0;
    }

    .submit-btn {
      height: 48px;
      font-size: 16px;
      margin-top: 8px;
      border-radius: var(--radius) !important;
      font-weight: 600 !important;
      transition: all var(--transition) !important;
    }

    .submit-btn:not(:disabled):hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 24px rgba(92, 107, 192, 0.4) !important;
    }

    .submit-btn.loading { opacity: 0.8; }
    .btn-spinner { display: inline-block; }
    .btn-text { animation: fadeIn 0.3s ease; }

    .visibility-toggle { transition: transform var(--transition); }
    .visibility-toggle:hover { transform: scale(1.1); }

    .auth-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #6B7A99;
      animation: fadeInUp 0.5s ease forwards;
      animation-delay: 0.4s;
      opacity: 0;
    }

    .auth-link a {
      color: #5C6BC0;
      text-decoration: none;
      font-weight: 600;
      transition: color var(--transition);
    }

    .auth-link a:hover { color: #7E57C2; }

    :host ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class ForgotPasswordComponent {
  resetForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      securityQuestion: ['', Validators.required],
      securityAnswer: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;
    this.loading = true;

    this.authService.forgotPassword(this.resetForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Password reset successful. You can now login.', 'Close', { duration: 5000 });
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Password reset failed', 'Close', { duration: 5000 });
      }
    });
  }
}
