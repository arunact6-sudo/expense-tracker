import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WalletService } from '../../../../core/services/wallet.service';
import { Wallet } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

const COLORS = ['#3f51b5', '#4caf50', '#f44336', '#ff9800', '#9c27b0', '#00bcd4', '#795548', '#607d8b'];

@Component({
  selector: 'app-wallet-form',
  template: `
    <h2 mat-dialog-title class="form-title">{{ data ? 'Edit Wallet' : 'New Wallet' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-1">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Wallet name">
          <mat-error>Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-2">
          <mat-label>Type</mat-label>
          <mat-select formControlName="type">
            <mat-option value="cash">Cash</mat-option>
            <mat-option value="bank_account">Bank Account</mat-option>
            <mat-option value="credit_card">Credit Card</mat-option>
            <mat-option value="debit_card">Debit Card</mat-option>
            <mat-option value="upi">UPI</mat-option>
            <mat-option value="other">Other</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-3" *ngIf="!data">
          <mat-label>Initial Balance</mat-label>
          <input matInput type="number" formControlName="balance">
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-4">
          <mat-label>Currency</mat-label>
          <mat-select formControlName="currency">
            <mat-option value="USD">USD - US Dollar</mat-option>
            <mat-option value="EUR">EUR - Euro</mat-option>
            <mat-option value="GBP">GBP - British Pound</mat-option>
            <mat-option value="INR">INR - Indian Rupee</mat-option>
            <mat-option value="JPY">JPY - Japanese Yen</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="animate-fade-in-up stagger-5">
          <label class="form-label">Color</label>
          <div class="color-grid">
            <button *ngFor="let c of colors" type="button" class="color-btn" [style.background]="c"
              [class.selected]="form.get('color')?.value === c" (click)="form.get('color')?.setValue(c)"></button>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="animate-fade-in-up stagger-6">
      <button mat-button mat-dialog-close class="btn-cancel">Cancel</button>
      <button mat-raised-button color="primary" class="btn-submit" [disabled]="form.invalid || loading" (click)="onSubmit()">
        {{ data ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .w-full { width: 100%; }
    .form-title {
      font-size: 20px;
      font-weight: 700;
      margin: 0;
      padding-bottom: 4px;
      color: var(--text);
    }
    .form-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 8px;
      display: block;
    }
    .color-grid {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }
    .color-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      border: 3px solid transparent;
      cursor: pointer;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
    }
    .color-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    .color-btn.selected {
      border-color: var(--primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }
    .btn-cancel {
      border-radius: var(--radius-md);
      font-weight: 600;
    }
    .btn-submit {
      border-radius: var(--radius-md);
      font-weight: 600;
      padding: 0 28px;
      box-shadow: var(--shadow-sm);
      transition: box-shadow var(--transition), transform var(--transition-fast);
    }
    .btn-submit:hover:not(:disabled) {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
  `]
})
export class WalletFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  colors = COLORS;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<WalletFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Wallet | null
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      type: ['cash', Validators.required],
      balance: [0],
      currency: ['USD', Validators.required],
      color: ['#3f51b5']
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({ name: this.data.name, type: this.data.type, balance: this.data.balance, currency: this.data.currency, color: this.data.color });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const request = this.data
      ? this.walletService.updateWallet(this.data._id, this.form.value)
      : this.walletService.createWallet(this.form.value);
    request.subscribe({
      next: () => { this.snackBar.open(`Wallet ${this.data ? 'updated' : 'created'}`, 'Close', { duration: 3000 }); this.dialogRef.close(true); },
      error: (err) => { this.loading = false; this.snackBar.open(err.error?.message || 'Error', 'Close', { duration: 5000 }); }
    });
  }
}
