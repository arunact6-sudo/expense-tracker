import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WalletService } from '../../../../core/services/wallet.service';
import { Wallet } from '../../../../core/models/user.model';
import { WalletFormComponent } from '../wallet-form/wallet-form.component';
import { WalletTransferComponent } from '../wallet-transfer/wallet-transfer.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-wallet-list',
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in-up">
        <h1>Wallets</h1>
        <div class="flex gap-8">
          <button mat-stroked-button color="primary" class="btn-action btn-action-stroked" (click)="openTransfer()">
            <mat-icon>swap_horiz</mat-icon> Transfer
          </button>
          <button mat-raised-button color="primary" class="btn-action btn-action-raised" (click)="openForm()">
            <mat-icon>add</mat-icon> Add Wallet
          </button>
        </div>
      </div>

      <div class="total-balance animate-fade-in-up stagger-1">
        <span class="total-label">Total Balance</span>
        <span class="total-value">{{ totalBalance | currencyFormat }}</span>
      </div>

      <div *ngIf="wallets.length === 0" class="empty-state animate-fade-in-up stagger-2">
        <mat-icon class="empty-icon">account_balance_wallet</mat-icon>
        <p class="empty-title">No wallets yet</p>
        <p class="empty-text">Create your first wallet to start tracking your balance.</p>
        <button mat-raised-button color="primary" class="btn-action btn-action-raised" (click)="openForm()">
          <mat-icon>add</mat-icon> Add Wallet
        </button>
      </div>

      <div class="wallet-grid" *ngIf="wallets.length > 0">
        <mat-card *ngFor="let wallet of wallets; let i = index"
          class="wallet-card animate-fade-in-up"
          [class]="'wallet-card animate-fade-in-up stagger-' + (i + 2)">
          <div class="wallet-color-bar" [style.background]="wallet.color || '#4F46E5'"></div>
          <div class="wallet-header">
            <div class="wallet-icon" [style.background]="wallet.color || '#4F46E5'">
              <mat-icon [style.color]="'white'">{{ getWalletIcon(wallet.type) }}</mat-icon>
            </div>
            <div class="wallet-actions">
              <button mat-icon-button [matMenuTriggerFor]="walletMenu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #walletMenu="matMenu">
                <button mat-menu-item (click)="openForm(wallet)">
                  <mat-icon>edit</mat-icon> Edit
                </button>
                <button mat-menu-item (click)="deleteWallet(wallet)">
                  <mat-icon color="warn">delete</mat-icon> Delete
                </button>
              </mat-menu>
            </div>
          </div>
          <div class="wallet-body">
            <h3 class="wallet-name">{{ wallet.name }}</h3>
            <span class="wallet-type">{{ wallet.type.replace('_', ' ') | titlecase }}</span>
            <div class="wallet-balance">{{ wallet.balance | currencyFormat }}</div>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .total-balance {
      background: var(--primary);
      color: white;
      padding: 32px;
      border-radius: var(--radius-lg);
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow-md);
      position: relative;
      overflow: hidden;
    }
    .total-balance::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .total-label {
      font-size: 13px;
      opacity: 0.85;
      margin-bottom: 8px;
      font-weight: 500;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .total-value {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }
    .wallet-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .wallet-card {
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      position: relative;
      transition: transform 0.3s var(--ease-spring), box-shadow var(--transition);
      opacity: 0;
      background: var(--surface);
    }
    .wallet-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg);
    }
    .wallet-color-bar {
      height: 3px;
      width: 100%;
      transition: height var(--transition-fast);
    }
    .wallet-card:hover .wallet-color-bar {
      height: 4px;
    }
    .wallet-header {
      display: flex;
      justify-content: space-between;
      padding: 20px 20px 0;
    }
    .wallet-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
    }
    .wallet-body {
      padding: 12px 20px 24px;
    }
    .wallet-name {
      font-size: 17px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--text);
    }
    .wallet-type {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    .wallet-balance {
      font-size: 28px;
      font-weight: 800;
      margin-top: 12px;
      letter-spacing: -0.5px;
      color: var(--text);
    }
    .btn-action {
      border-radius: var(--radius-md);
      font-weight: 600;
      padding: 0 24px;
      height: 42px;
      transition: box-shadow var(--transition), transform var(--transition-fast);
    }
    .btn-action-raised {
      box-shadow: var(--shadow-sm);
    }
    .btn-action-raised:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }
    .btn-action-stroked {
      transition: background var(--transition), transform var(--transition-fast);
    }
    .btn-action-stroked:hover {
      transform: translateY(-1px);
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      color: var(--text);
    }
    .flex { display: flex; }
    .gap-8 { gap: 8px; }
    .empty-state {
      text-align: center;
      padding: 64px 32px;
      background: var(--surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      opacity: 0;
    }
    .empty-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--text-tertiary);
      margin-bottom: 16px;
    }
    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
      margin: 0 0 8px;
    }
    .empty-text {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0 0 24px;
    }
  `]
})
export class WalletListComponent implements OnInit {
  wallets: Wallet[] = [];
  totalBalance = 0;

  constructor(
    private walletService: WalletService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadWallets();
  }

  loadWallets(): void {
    this.walletService.getWallets().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.wallets = res.data;
          this.totalBalance = this.wallets.reduce((sum, w) => sum + w.balance, 0);
        }
      }
    });
  }

  getWalletIcon(type: string): string {
    const icons: Record<string, string> = {
      cash: 'payments',
      bank_account: 'account_balance',
      credit_card: 'credit_card',
      debit_card: 'credit_card',
      upi: 'phone_android',
      other: 'account_balance_wallet'
    };
    return icons[type] || 'account_balance_wallet';
  }

  openForm(wallet?: Wallet): void {
    const dialogRef = this.dialog.open(WalletFormComponent, { width: '400px', data: wallet || null });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadWallets(); });
  }

  openTransfer(): void {
    const dialogRef = this.dialog.open(WalletTransferComponent, { width: '400px', data: { wallets: this.wallets } });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadWallets(); });
  }

  deleteWallet(wallet: Wallet): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Wallet', message: `Delete "${wallet.name}"?`, confirmText: 'Delete', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.walletService.deleteWallet(wallet._id).subscribe({
          next: () => { this.snackBar.open('Wallet deleted', 'Close', { duration: 3000 }); this.loadWallets(); }
        });
      }
    });
  }
}
