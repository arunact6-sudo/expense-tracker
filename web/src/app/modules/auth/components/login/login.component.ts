import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline" class="w-full stagger-1 animate-fade-in-up">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email" placeholder="you@example.com">
        <mat-icon matPrefix>mail_outline</mat-icon>
        <mat-error *ngIf="loginForm.get('email')?.hasError('required')">Email is required</mat-error>
        <mat-error *ngIf="loginForm.get('email')?.hasError('email')">Enter a valid email</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full stagger-2 animate-fade-in-up">
        <mat-label>Password</mat-label>
        <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
        <mat-icon matPrefix>lock_outline</mat-icon>
        <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
          <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        <mat-error *ngIf="loginForm.get('password')?.hasError('required')">Password is required</mat-error>
      </mat-form-field>

      <div class="form-footer stagger-3 animate-fade-in-up">
        <a routerLink="/auth/forgot-password">Forgot password?</a>
      </div>

      <button mat-raised-button color="primary" type="submit" class="w-full submit-btn stagger-3 animate-fade-in-up"
        [disabled]="loading">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">Sign In</span>
      </button>

      <div class="alt-action stagger-4 animate-fade-in-up">
        <span>Don't have an account?</span>
        <a routerLink="/auth/register">Create account</a>
      </div>
    </form>
  `,
  styles: [`
    .w-full { width: 100%; }
    .stagger-1, .stagger-2, .stagger-3, .stagger-4 { opacity: 0; }
    .form-footer { display: flex; justify-content: flex-end; margin-bottom: 20px; margin-top: -4px; }
    .form-footer a { font-size: 13px; color: var(--primary); font-weight: 500; }
    .form-footer a:hover { color: var(--primary-dark); }
    .submit-btn {
      height: 44px;
      font-size: 15px;
      margin-bottom: 16px;
      width: 100%;
    }
    .submit-btn mat-spinner { display: inline-block; }
    .alt-action {
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
    }
    .alt-action a { font-weight: 600; margin-left: 4px; }
    :host ::ng-deep .mat-mdc-form-field-subscript-wrapper { display: none; }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.snackBar.open('Welcome back!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Login failed', 'Close', { duration: 5000 });
      }
    });
  }
}
