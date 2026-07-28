import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { BillService } from '../../../../core/services/bill.service';
import { Bill } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bill-detail',
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <span class="title-text">{{ data.title }}</span>
    </h2>
    <mat-dialog-content>
      <div class="detail-grid">
        <div class="detail-item animate-fade-in-up stagger-1">
          <label>Amount</label>
          <span class="amount-display">{{ data.amount | currencyFormat }}</span>
        </div>
        <div class="detail-item animate-fade-in-up stagger-2">
          <label>Category</label>
          <span>{{ data.category?.name || 'N/A' }}</span>
        </div>
        <div class="detail-item animate-fade-in-up stagger-3">
          <label>Due Date</label>
          <span>{{ data.dueDate | date:'fullDate' }}</span>
        </div>
        <div class="detail-item animate-fade-in-up stagger-4">
          <label>Status</label>
          <span class="status-badge" [ngClass]="data.isPaid ? 'status-paid' : 'status-upcoming'">
            <span class="status-dot"></span>
            {{ data.isPaid ? 'Paid' : 'Unpaid' }}
          </span>
        </div>
        <div class="detail-item animate-fade-in-up stagger-5" *ngIf="data.isPaid && data.paidDate">
          <label>Paid Date</label>
          <span>{{ data.paidDate | date:'medium' }}</span>
        </div>
        <div class="detail-item animate-fade-in-up stagger-5">
          <label>Recurring</label>
          <span>{{ data.isRecurring ? 'Yes - ' + (data.frequency | titlecase) : 'No' }}</span>
        </div>
        <div class="detail-item full-width animate-fade-in-up stagger-6" *ngIf="data.notes">
          <label>Notes</label>
          <span>{{ data.notes }}</span>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close class="close-btn">Close</button>
      <button mat-raised-button color="primary" class="premium-btn pay-btn" *ngIf="!data.isPaid" (click)="markAsPaid()">
        <mat-icon>check_circle</mat-icon> Mark as Paid
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      font-size: 22px;
      font-weight: 700;
      padding-bottom: 8px;
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding: 8px 0;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 14px 16px;
      background: var(--bg);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      transition: transform var(--transition-spring), box-shadow var(--transition), border-color var(--transition);
    }
    .detail-item:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
      border-color: var(--primary-light);
    }
    .detail-item.full-width {
      grid-column: 1 / -1;
    }
    .detail-item label {
      font-size: 11px;
      color: var(--text-secondary);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.8px;
    }
    .detail-item span:not(.status-badge):not(.amount-display) {
      font-size: 14px;
      font-weight: 500;
    }
    .amount-display {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 600;
      width: fit-content;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .status-paid {
      background: rgba(76,175,80,0.1);
      color: #4caf50;
    }
    .status-paid .status-dot {
      background: #4caf50;
      box-shadow: 0 0 6px rgba(76,175,80,0.4);
    }
    .status-upcoming {
      background: rgba(33,150,243,0.1);
      color: #2196f3;
    }
    .status-upcoming .status-dot {
      background: #2196f3;
      box-shadow: 0 0 6px rgba(33,150,243,0.4);
    }
    .close-btn {
      border-radius: var(--radius) !important;
      font-weight: 500 !important;
    }
    .pay-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: var(--radius) !important;
      font-weight: 600 !important;
      padding: 0 24px !important;
    }
    .pay-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class BillDetailComponent {
  constructor(
    private billService: BillService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BillDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Bill
  ) {}

  markAsPaid(): void {
    this.billService.markAsPaid(this.data._id).subscribe({
      next: () => {
        this.snackBar.open('Bill marked as paid', 'Close', { duration: 3000 });
        this.data.isPaid = true;
        this.data.paidDate = new Date().toISOString();
        this.dialogRef.close(true);
      }
    });
  }
}
