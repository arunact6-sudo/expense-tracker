import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  template: `
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline" class="w-full stagger-1 animate-fade-in-up">
        <mat-label>Full Name</mat-label>
        <input matInput formControlName="name" placeholder="John Doe">
        <mat-icon matPrefix>person_outline</mat-icon>
        <mat-error>Name is required</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full stagger-2 animate-fade-in-up">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email" placeholder="you@example.com">
        <mat-icon matPrefix>mail_outline</mat-icon>
        <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email is required</mat-error>
        <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Enter a valid email</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full stagger-3 animate-fade-in-up">
        <mat-label>Phone</mat-label>
        <input matInput formControlName="phone" placeholder="Optional">
        <mat-icon matPrefix>phone_outlined</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full stagger-4 animate-fade-in-up">
        <mat-label>Password</mat-label>
        <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
        <mat-icon matPrefix>lock_outline</mat-icon>
        <button mat-icon-button matSuffix type="button" (click)="hidePassword = !hidePassword">
          <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Password is required</mat-error>
        <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Minimum 6 characters</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full stagger-5 animate-fade-in-up">
        <mat-label>Confirm Password</mat-label>
        <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword">
        <mat-icon matPrefix>lock_outline</mat-icon>
        <button mat-icon-button matSuffix type="button" (click)="hideConfirmPassword = !hideConfirmPassword">
          <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Please confirm password</mat-error>
        <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('passwordMismatch')">Passwords do not match</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full stagger-6 animate-fade-in-up">
        <mat-label>Security Question</mat-label>
        <mat-select formControlName="securityQuestion">
          <mat-option value="">Select a question</mat-option>
          <mat-option value="pet">What is your pet's name?</mat-option>
          <mat-option value="school">What school did you attend?</mat-option>
          <mat-option value="city">What city were you born in?</mat-option>
          <mat-option value="color">What is your favorite color?</mat-option>
          <mat-option value="food">What is your favorite food?</mat-option>
        </mat-select>
        <mat-icon matPrefix>help_outline</mat-icon>
        <mat-error>Select a security question</mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="w-full stagger-7 animate-fade-in-up">
        <mat-label>Security Answer</mat-label>
        <input matInput formControlName="securityAnswer" placeholder="Your answer">
        <mat-icon matPrefix>edit_note</mat-icon>
        <mat-error>Security answer is required</mat-error>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" class="w-full submit-btn stagger-8 animate-fade-in-up"
        [disabled]="loading">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        <span *ngIf="!loading">Create Account</span>
      </button>

      <div class="alt-action">
        <span>Already have an account?</span>
        <a routerLink="/auth/login">Sign in</a>
      </div>
    </form>
  `,
  styles: [`
    .w-full { width: 100%; }
    .stagger-1, .stagger-2, .stagger-3, .stagger-4, .stagger-5, .stagger-6, .stagger-7, .stagger-8 { opacity: 0; }
    .submit-btn {
      height: 44px;
      font-size: 15px;
      margin: 8px 0 16px;
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
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      securityQuestion: ['', Validators.required],
      securityAnswer: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    const { confirmPassword, ...data } = this.registerForm.value;

    this.authService.register(data).subscribe({
      next: () => {
        this.snackBar.open('Account created!', 'Close', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Registration failed', 'Close', { duration: 5000 });
      }
    });
  }
}
