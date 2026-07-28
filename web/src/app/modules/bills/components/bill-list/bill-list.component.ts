import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BillService } from '../../../../core/services/bill.service';
import { Bill } from '../../../../core/models/user.model';
import { BillFormComponent } from '../bill-form/bill-form.component';
import { BillDetailComponent } from '../bill-detail/bill-detail.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-bill-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Bills</h1>
        <button mat-raised-button color="primary" (click)="openForm()" class="premium-btn">
          <mat-icon>add</mat-icon> Add Bill
        </button>
      </div>

      <div class="bills-summary">
        <mat-card class="summary-card summary-upcoming animate-fade-in-up stagger-1">
          <div class="summary-icon-wrap upcoming-icon">
            <mat-icon>schedule</mat-icon>
          </div>
          <span class="summary-label">Upcoming</span>
          <span class="summary-value text-info">{{ upcomingCount }}</span>
        </mat-card>
        <mat-card class="summary-card summary-overdue animate-fade-in-up stagger-2">
          <div class="summary-icon-wrap overdue-icon">
            <mat-icon>warning</mat-icon>
          </div>
          <span class="summary-label">Overdue</span>
          <span class="summary-value text-danger">{{ overdueCount }}</span>
        </mat-card>
        <mat-card class="summary-card summary-paid animate-fade-in-up stagger-3">
          <div class="summary-icon-wrap paid-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <span class="summary-label">Paid This Month</span>
          <span class="summary-value text-success">{{ paidCount }}</span>
        </mat-card>
      </div>

      <mat-card class="table-card animate-fade-in-up stagger-4">
        <div class="table-wrapper">
          <table mat-table [dataSource]="bills">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let bill">
                {{ bill.title }}
                <mat-icon *ngIf="bill.isRecurring" class="recurring-icon" matTooltip="Recurring">autorenew</mat-icon>
              </td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let bill" class="font-bold amount-cell">{{ bill.amount | currencyFormat }}</td>
            </ng-container>
            <ng-container matColumnDef="dueDate">
              <th mat-header-cell *matHeaderCellDef>Due Date</th>
              <td mat-cell *matCellDef="let bill" [class.text-danger]="isOverdue(bill)">{{ bill.dueDate | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let bill">
                <span class="status-badge" [ngClass]="getStatusClass(bill)">{{ getStatusText(bill) }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let bill">
                <button mat-raised-button color="primary" *ngIf="!bill.isPaid" (click)="markAsPaid(bill)" class="pay-btn premium-btn">
                  <mat-icon>check</mat-icon> Pay
                </button>
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openForm(bill)"><mat-icon>edit</mat-icon> Edit</button>
                  <button mat-menu-item (click)="deleteBill(bill)"><mat-icon color="warn">delete</mat-icon> Delete</button>
                </mat-menu>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row" (click)="viewBill(row)"></tr>
          </table>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .bills-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      padding: 24px 20px;
      border-radius: var(--radius-lg, 14px);
      text-align: center;
      opacity: 0;
      position: relative;
      overflow: hidden;
      transition: transform var(--transition-spring, 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)),
                  box-shadow var(--transition, 0.25s);
    }

    .summary-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-lg, 0 12px 40px rgba(26,33,56,0.12));
    }

    .summary-upcoming::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #1E88E5, #42A5F5);
    }

    .summary-overdue::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #EF5350, #E53935);
    }

    .summary-paid::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #43A047, #66BB6A);
    }

    .summary-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }

    .summary-icon-wrap mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #fff;
    }

    .upcoming-icon { background: var(--info-gradient, linear-gradient(135deg, #1E88E5, #42A5F5)); }
    .overdue-icon { background: linear-gradient(135deg, #EF5350, #E53935); }
    .paid-icon { background: var(--success-gradient, linear-gradient(135deg, #43A047, #66BB6A)); }

    .summary-label {
      display: block;
      font-size: 13px;
      color: var(--text-secondary, #6B7A99);
      margin-bottom: 6px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .summary-value {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .table-card {
      border-radius: var(--radius-lg, 14px);
    }

    .table-wrapper { overflow-x: auto; }

    .clickable-row {
      cursor: pointer;
      transition: background var(--transition, 0.25s);
    }

    .clickable-row:hover {
      background: rgba(92, 107, 192, 0.04);
    }

    .amount-cell {
      font-weight: 700;
      font-size: 14px;
      letter-spacing: -0.2px;
    }

    .recurring-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      vertical-align: middle;
      margin-left: 4px;
      color: var(--primary, #5C6BC0);
    }

    .status-badge {
      padding: 5px 14px;
      border-radius: var(--radius-full, 9999px);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.3px;
      display: inline-block;
    }

    .status-paid {
      background: linear-gradient(135deg, rgba(67, 160, 71, 0.12), rgba(102, 187, 106, 0.12));
      color: var(--success, #43A047);
    }

    .status-upcoming {
      background: linear-gradient(135deg, rgba(30, 136, 229, 0.12), rgba(66, 165, 245, 0.12));
      color: var(--info, #1E88E5);
    }

    .status-overdue {
      background: linear-gradient(135deg, rgba(239, 83, 80, 0.12), rgba(229, 57, 53, 0.12));
      color: var(--warn, #EF5350);
    }

    .pay-btn {
      font-size: 12px;
      margin-right: 8px;
      border-radius: var(--radius, 10px) !important;
      font-weight: 600 !important;
      display: inline-flex !important;
      align-items: center;
      gap: 4px;
    }

    @media (max-width: 768px) {
      .bills-summary { grid-template-columns: 1fr; }
    }
  `]
})
export class BillListComponent implements OnInit {
  bills: Bill[] = [];
  displayedColumns = ['title', 'amount', 'dueDate', 'status', 'actions'];
  upcomingCount = 0;
  overdueCount = 0;
  paidCount = 0;

  constructor(
    private billService: BillService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadBills(); }

  loadBills(): void {
    this.billService.getBills().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.bills = res.data;
          this.upcomingCount = this.bills.filter(b => !b.isPaid && !this.isOverdue(b)).length;
          this.overdueCount = this.bills.filter(b => !b.isPaid && this.isOverdue(b)).length;
          this.paidCount = this.bills.filter(b => b.isPaid).length;
        }
      }
    });
  }

  isOverdue(bill: Bill): boolean {
    return !bill.isPaid && new Date(bill.dueDate) < new Date();
  }

  getStatusClass(bill: Bill): string {
    if (bill.isPaid) return 'status-paid';
    if (this.isOverdue(bill)) return 'status-overdue';
    return 'status-upcoming';
  }

  getStatusText(bill: Bill): string {
    if (bill.isPaid) return 'Paid';
    if (this.isOverdue(bill)) return 'Overdue';
    return 'Upcoming';
  }

  openForm(bill?: Bill): void {
    const dialogRef = this.dialog.open(BillFormComponent, { width: '500px', data: bill || null });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadBills(); });
  }

  viewBill(bill: Bill): void {
    const dialogRef = this.dialog.open(BillDetailComponent, { width: '500px', data: bill });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadBills(); });
  }

  markAsPaid(bill: Bill): void {
    this.billService.markAsPaid(bill._id).subscribe({
      next: () => { this.snackBar.open('Bill marked as paid', 'Close', { duration: 3000 }); this.loadBills(); }
    });
  }

  deleteBill(bill: Bill): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Bill', message: `Delete "${bill.title}"?`, confirmText: 'Delete', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.billService.deleteBill(bill._id).subscribe({
          next: () => { this.snackBar.open('Bill deleted', 'Close', { duration: 3000 }); this.loadBills(); }
        });
      }
    });
  }
}
