import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../../../core/services/transaction.service';
import { Transaction } from '../../../../core/models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-transaction-detail',
  template: `
    <div class="page-container" *ngIf="transaction">
      <div class="page-header animate-fade-in-up stagger-1">
        <div class="header-left">
          <button mat-icon-button (click)="goBack()" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1 class="page-title">Transaction Details</h1>
        </div>
        <div class="header-actions">
          <button mat-stroked-button color="primary" (click)="edit()" class="action-btn edit-btn">
            <mat-icon>edit</mat-icon> Edit
          </button>
          <button mat-stroked-button color="warn" (click)="deleteTransaction()" class="action-btn delete-btn">
            <mat-icon>delete</mat-icon> Delete
          </button>
        </div>
      </div>

      <mat-card class="detail-card animate-fade-in-up stagger-2">
        <div class="detail-hero">
          <div class="detail-amount" [class]="transaction.type === 'income' ? 'amount-income' : 'amount-expense'">
            {{ transaction.type === 'income' ? '+' : '-' }}{{ transaction.amount | currencyFormat }}
          </div>
          <div class="detail-type-row">
            <span class="type-badge" [ngClass]="'type-' + transaction.type">
              <mat-icon class="badge-icon">{{ transaction.type === 'income' ? 'arrow_upward' : (transaction.type === 'expense' ? 'arrow_downward' : 'swap_horiz') }}</mat-icon>
              {{ transaction.type }}
            </span>
            <span class="detail-title">{{ transaction.title }}</span>
          </div>
        </div>

        <div class="detail-divider"></div>

        <div class="detail-grid">
          <div class="detail-item animate-fade-in-up stagger-3">
            <label>Category</label>
            <span class="detail-value">
              <span class="category-dot" [style.background]="transaction.category?.color || '#CBD5E1'"></span>
              {{ transaction.category?.name || 'Uncategorized' }}
            </span>
          </div>
          <div class="detail-item animate-fade-in-up stagger-3">
            <label>Wallet</label>
            <span class="detail-value">{{ transaction.wallet?.name || 'N/A' }}</span>
          </div>
          <div class="detail-item animate-fade-in-up stagger-4">
            <label>Date</label>
            <span class="detail-value">{{ transaction.date | date:'MMMM d, y' }}</span>
          </div>
          <div class="detail-item animate-fade-in-up stagger-4" *ngIf="transaction.time">
            <label>Time</label>
            <span class="detail-value">{{ transaction.time }}</span>
          </div>
          <div class="detail-item animate-fade-in-up stagger-5">
            <label>Payment Method</label>
            <span class="detail-value">{{ transaction.paymentMethod | titlecase }}</span>
          </div>
          <div class="detail-item animate-fade-in-up stagger-5" *ngIf="transaction.toWallet">
            <label>To Wallet</label>
            <span class="detail-value">{{ transaction.toWallet?.name }}</span>
          </div>
          <div class="detail-item animate-fade-in-up stagger-6" *ngIf="transaction.merchantName">
            <label>Merchant</label>
            <span class="detail-value">{{ transaction.merchantName }}</span>
          </div>
          <div class="detail-item animate-fade-in-up stagger-6" *ngIf="transaction.location">
            <label>Location</label>
            <span class="detail-value">{{ transaction.location }}</span>
          </div>
          <div class="detail-item full-width animate-fade-in-up stagger-7" *ngIf="transaction.notes">
            <label>Notes</label>
            <span class="detail-value notes-text">{{ transaction.notes }}</span>
          </div>
          <div class="detail-item full-width animate-fade-in-up stagger-7" *ngIf="transaction.tags?.length">
            <label>Tags</label>
            <div class="tags">
              <span class="tag" *ngFor="let tag of transaction.tags">#{{ tag }}</span>
            </div>
          </div>
          <div class="detail-item animate-fade-in-up stagger-8" *ngIf="transaction.recurring?.isRecurring">
            <label>Recurring</label>
            <span class="detail-value">
              <mat-icon class="sm-icon">autorenew</mat-icon>
              Yes &mdash; {{ transaction.recurring?.frequency | titlecase }}
            </span>
          </div>
          <div class="detail-item animate-fade-in-up stagger-8">
            <label>Created</label>
            <span class="detail-value text-muted">{{ transaction.createdAt | date:'medium' }}</span>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    /* Design Variables & Animations */
    :host {
      --radius-lg: 24px;
      --radius-md: 12px;
      --radius-full: 9999px;
      --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
      --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
      --border-light: rgba(0, 0, 0, 0.06);
    }

    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(20px) scale(0.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    .animate-fade-in-up {
      opacity: 0;
      animation: fadeInUp 0.6s var(--ease-out) forwards;
    }

    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.15s; }
    .stagger-3 { animation-delay: 0.2s; }
    .stagger-4 { animation-delay: 0.25s; }
    .stagger-5 { animation-delay: 0.3s; }
    .stagger-6 { animation-delay: 0.35s; }
    .stagger-7 { animation-delay: 0.4s; }
    .stagger-8 { animation-delay: 0.45s; }

    /* Layout & Header */
    .page-container {
      padding: 32px 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header-left { display: flex; align-items: center; gap: 16px; flex: 1; }
    .page-title { margin: 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.02em; }
    
    .back-btn { 
      background: #F3F4F6;
      transition: all 0.2s ease; 
    }
    .back-btn:hover { background: #E5E7EB; transform: translateX(-4px); }
    
    .header-actions { display: flex; gap: 12px; }
    
    .action-btn {
      border-radius: var(--radius-md);
      font-weight: 600;
      letter-spacing: 0.02em;
      transition: all 0.2s ease;
      padding: 0 20px;
    }
    .action-btn mat-icon { margin-right: 4px; font-size: 18px; width: 18px; height: 18px; }
    .action-btn:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }

    /* Premium Glass/Neumorphic Card */
    .detail-card {
      border-radius: var(--radius-lg) !important;
      background: linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(249,250,251,0.8) 100%) !important;
      backdrop-filter: blur(12px);
      box-shadow: var(--shadow-md) !important;
      border: 1px solid rgba(255, 255, 255, 0.9);
      padding: 0;
      overflow: hidden;
      opacity: 0;
    }

    /* Hero Section */
    .detail-hero {
      text-align: center;
      padding: 48px 32px 36px;
      background: linear-gradient(180deg, rgba(249, 250, 251, 0.5) 0%, rgba(255,255,255,0) 100%);
    }

    .detail-amount {
      font-size: 52px;
      font-weight: 800;
      margin-bottom: 16px;
      font-variant-numeric: tabular-nums;
      letter-spacing: -1.5px;
      line-height: 1.1;
    }
    
    .amount-income { 
      background: linear-gradient(135deg, #10B981, #059669); 
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
    }
    .amount-expense { 
      background: linear-gradient(135deg, #EF4444, #DC2626); 
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
    }

    .detail-type-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }
    
    .detail-title {
      font-size: 18px;
      color: #4B5563;
      font-weight: 500;
    }

    .type-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      border-radius: var(--radius-full);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-icon { font-size: 16px; width: 16px; height: 16px; }
    
    .type-income { background: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.2); }
    .type-expense { background: rgba(239, 68, 68, 0.1); color: #DC2626; border: 1px solid rgba(239, 68, 68, 0.2); }
    .type-transfer { background: rgba(59, 130, 246, 0.1); color: #2563EB; border: 1px solid rgba(59, 130, 246, 0.2); }

    /* Layout & Divider */
    .detail-divider {
      height: 1px;
      background: var(--border-light);
      margin: 0;
      width: 100%;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 24px 32px;
      border-bottom: 1px solid var(--border-light);
    }
    
    .detail-item:nth-child(odd) { border-right: 1px solid var(--border-light); }
    /* Remove bottom border for the last items in a 2-column grid */
    .detail-item:nth-last-child(-n+2):not(.full-width) { border-bottom: none; }
    .detail-item:last-child { border-bottom: none; }
    
    .detail-item.full-width {
      grid-column: 1 / -1;
      border-right: none;
    }

    .detail-item label {
      font-size: 12px;
      color: #6B7280;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.08em;
    }
    
    .detail-value {
      font-size: 15px;
      color: #111827;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
      line-height: 1.5;
    }
    
    .notes-text {
      color: #4B5563;
      font-weight: 400;
      white-space: pre-wrap;
    }

    .text-muted { color: #9CA3AF; font-weight: 400; font-size: 14px; }
    
    .sm-icon { font-size: 18px; width: 18px; height: 18px; color: #6B7280; }

    .category-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px rgba(255,255,255,0.8);
    }

    /* Tags */
    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
    .tag {
      background: #F3F4F6;
      border: 1px solid #E5E7EB;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: 13px;
      font-weight: 600;
      color: #4B5563;
      transition: all 0.2s ease;
    }
    .tag:hover { background: #E5E7EB; color: #111827; }

    /* Responsive Design */
    @media (max-width: 640px) {
      .page-container { padding: 16px; }
      
      .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .header-left { width: 100%; }
      .header-actions { width: 100%; justify-content: stretch; }
      .action-btn { flex: 1; justify-content: center; }

      .detail-hero { padding: 32px 20px 24px; }
      .detail-amount { font-size: 40px; }
      
      .detail-grid { grid-template-columns: 1fr; }
      .detail-item { padding: 20px 24px; }
      .detail-item:nth-child(odd) { border-right: none; }
      .detail-item { border-bottom: 1px solid var(--border-light) !important; }
      .detail-item:last-child { border-bottom: none !important; }
    }
  `]
})
export class TransactionDetailComponent implements OnInit {
  transaction: Transaction | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.transactionService.getTransaction(id).subscribe({
        next: (res) => {
          if (res.success && res.data) this.transaction = res.data;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/transactions']);
  }

  edit(): void {
    if (!this.transaction) return;
    const dialogRef = this.dialog.open(TransactionFormComponent, {
      width: '600px',
      data: this.transaction
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.transactionService.getTransaction(this.transaction!._id).subscribe({
          next: (res) => {
            if (res.success && res.data) this.transaction = res.data;
          }
        });
      }
    });
  }

  deleteTransaction(): void {
    if (!this.transaction) return;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Transaction', message: 'Are you sure you want to delete this transaction?', confirmText: 'Delete', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.transactionService.deleteTransaction(this.transaction!._id).subscribe({
          next: () => {
            this.snackBar.open('Transaction deleted successfully', 'Close', { duration: 3000, horizontalPosition: 'right', verticalPosition: 'top' });
            this.router.navigate(['/transactions']);
          }
        });
      }
    });
  }
}