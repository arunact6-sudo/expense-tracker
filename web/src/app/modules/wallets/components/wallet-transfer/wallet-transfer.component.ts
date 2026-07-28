import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WalletService } from '../../../../core/services/wallet.service';
import { Wallet } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-wallet-transfer',
  template: `
    <h2 mat-dialog-title class="form-title">Transfer Between Wallets</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-1">
          <mat-label>From Wallet</mat-label>
          <mat-select formControlName="fromWallet">
            <mat-option *ngFor="let w of wallets" [value]="w._id">{{ w.name }} ({{ w.balance | currencyFormat }})</mat-option>
          </mat-select>
          <mat-error>Source wallet is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-2">
          <mat-label>To Wallet</mat-label>
          <mat-select formControlName="toWallet">
            <mat-option *ngFor="let w of wallets" [value]="w._id">{{ w.name }} ({{ w.balance | currencyFormat }})</mat-option>
          </mat-select>
          <mat-error>Destination wallet is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-3">
          <mat-label>Amount</mat-label>
          <input matInput type="number" formControlName="amount" placeholder="0.00">
          <mat-error>Amount is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full animate-fade-in-up stagger-4">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="2" placeholder="Optional notes"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="animate-fade-in-up stagger-5">
      <button mat-button mat-dialog-close class="btn-cancel">Cancel</button>
      <button mat-raised-button color="primary" class="btn-submit" [disabled]="form.invalid || loading" (click)="onSubmit()">Transfer</button>
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
export class WalletTransferComponent {
  form: FormGroup;
  loading = false;
  wallets: Wallet[];

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<WalletTransferComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { wallets: Wallet[] }
  ) {
    this.wallets = data.wallets;
    this.form = this.fb.group({
      fromWallet: ['', Validators.required],
      toWallet: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      notes: ['']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.walletService.transferBetweenWallets(this.form.value).subscribe({
      next: () => { this.snackBar.open('Transfer completed', 'Close', { duration: 3000 }); this.dialogRef.close(true); },
      error: (err) => { this.loading = false; this.snackBar.open(err.error?.message || 'Transfer failed', 'Close', { duration: 5000 }); }
    });
  }
}
