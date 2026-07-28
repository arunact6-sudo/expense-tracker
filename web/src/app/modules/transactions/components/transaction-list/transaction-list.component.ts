import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CategoryService } from '../../../../core/services/category.service';
import { WalletService } from '../../../../core/services/wallet.service';
import { Transaction, Category, Wallet } from '../../../../core/models/user.model';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-transaction-list',
  template: `
    <div class="page-container">
      <div class="page-header animate-fade-in-up stagger-1">
        <h1>Transactions</h1>
        <button mat-raised-button color="primary" (click)="openForm()" class="add-btn">
          <mat-icon>add</mat-icon> Add Transaction
        </button>
      </div>

      <mat-card class="filter-card animate-fade-in-up stagger-2">
        <div class="filter-row">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Search</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Search transactions">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Type</mat-label>
            <mat-select [formControl]="typeFilter">
              <mat-option value="">All</mat-option>
              <mat-option value="income">Income</mat-option>
              <mat-option value="expense">Expense</mat-option>
              <mat-option value="transfer">Transfer</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Category</mat-label>
            <mat-select [formControl]="categoryFilter">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let c of categories" [value]="c._id">{{ c.name }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Wallet</mat-label>
            <mat-select [formControl]="walletFilter">
              <mat-option value="">All</mat-option>
              <mat-option *ngFor="let w of wallets" [value]="w._id">{{ w.name }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" [formControl]="startDateFilter">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" [formControl]="endDateFilter">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
        </div>
      </mat-card>

      <mat-card class="table-card animate-fade-in-up stagger-3">
        <div class="table-wrapper">
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Title</th>
              <td mat-cell *matCellDef="let row">{{ row.title }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
              <td mat-cell *matCellDef="let row" [class]="row.type === 'income' ? 'amount-income' : 'amount-expense'">
                {{ row.type === 'income' ? '+' : '-' }}{{ row.amount | currencyFormat }}
              </td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let row">
                <span class="category-badge" [style.background]="row.category?.color + '1A'" [style.color]="row.category?.color">
                  {{ row.category?.name || 'N/A' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
              <td mat-cell *matCellDef="let row">{{ row.date | date:'mediumDate' }}</td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let row">
                <span class="type-indicator">
                  <span class="type-dot" [ngClass]="'dot-' + row.type"></span>
                  <span class="type-badge" [ngClass]="'type-' + row.type">{{ row.type }}</span>
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="wallet">
              <th mat-header-cell *matHeaderCellDef>Wallet</th>
              <td mat-cell *matCellDef="let row">{{ row.wallet?.name || 'N/A' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button [matMenuTriggerFor]="actionMenu" class="action-btn">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #actionMenu="matMenu">
                  <button mat-menu-item (click)="openForm(row)">
                    <mat-icon>edit</mat-icon> Edit
                  </button>
                  <button mat-menu-item (click)="duplicate(row)">
                    <mat-icon>content_copy</mat-icon> Duplicate
                  </button>
                  <button mat-menu-item (click)="delete(row)">
                    <mat-icon color="warn">delete</mat-icon> Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row"></tr>

            <tr class="empty-row" *matNoData>
              <td class="empty-cell" [attr.colspan]="displayedColumns.length">
                <div class="empty-state">
                  <mat-icon class="empty-icon">receipt_long</mat-icon>
                  <p class="empty-title">No transactions found</p>
                  <p class="empty-subtitle">Try adjusting your filters or add a new transaction</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { align-items: center; }
    .page-header h1 { flex: 1; }
    .add-btn { border-radius: var(--radius-md); font-weight: 500; box-shadow: var(--shadow-sm); }
    .add-btn:hover { box-shadow: var(--shadow-md); }

    .filter-card {
      margin-bottom: 20px;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      padding: 20px;
      opacity: 0;
    }
    .filter-row { display: flex; flex-wrap: wrap; gap: 12px; }
    .filter-field { flex: 1; min-width: 160px; }

    .table-card {
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      opacity: 0;
    }
    .table-wrapper { overflow-x: auto; }

    .amount-income { color: var(--success); font-weight: 600; font-variant-numeric: tabular-nums; }
    .amount-expense { color: var(--warn); font-weight: 600; font-variant-numeric: tabular-nums; }

    .category-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
    }

    .type-indicator { display: inline-flex; align-items: center; gap: 6px; }
    .type-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    }
    .dot-income { background: var(--success); }
    .dot-expense { background: var(--warn); }
    .dot-transfer { background: var(--info); }

    .type-badge {
      padding: 2px 10px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }
    .type-income { background: rgba(16, 185, 129, 0.1); color: var(--success); }
    .type-expense { background: rgba(239, 68, 68, 0.1); color: var(--warn); }
    .type-transfer { background: rgba(59, 130, 246, 0.1); color: var(--info); }

    .clickable-row { cursor: pointer; transition: background var(--transition-fast); }
    .clickable-row:hover { background: var(--bg-secondary); }

    .action-btn { opacity: 0.5; transition: opacity var(--transition-fast); }
    .clickable-row:hover .action-btn { opacity: 1; }

    .empty-row td { border: none; }
    .empty-cell { padding: 60px 20px; text-align: center; }
    .empty-state { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .empty-icon { font-size: 56px; width: 56px; height: 56px; color: var(--text-tertiary); opacity: 0.4; margin-bottom: 8px; }
    .empty-title { font-size: 16px; font-weight: 600; color: var(--text-secondary); margin: 0; }
    .empty-subtitle { font-size: 13px; color: var(--text-tertiary); margin: 0; }

    ::ng-deep .mat-mdc-paginator { border-top: 1px solid var(--border-light); }
    ::ng-deep .mat-mdc-table { background: transparent; }
    ::ng-deep .mat-header-cell { color: var(--text-tertiary); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom-color: var(--border-light); }
    ::ng-deep .mat-mdc-cell { border-bottom-color: var(--border-light); color: var(--text); }
  `]
})
export class TransactionListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['title', 'amount', 'category', 'date', 'type', 'wallet', 'actions'];
  dataSource = new MatTableDataSource<Transaction>();
  categories: Category[] = [];
  wallets: Wallet[] = [];

  searchControl = new FormControl('');
  typeFilter = new FormControl('');
  categoryFilter = new FormControl('');
  walletFilter = new FormControl('');
  startDateFilter = new FormControl('');
  endDateFilter = new FormControl('');

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private walletService: WalletService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.categoryService.getCategories().subscribe(res => {
      if (res.success && res.data) this.categories = res.data;
    });
    this.walletService.getWallets().subscribe(res => {
      if (res.success && res.data) this.wallets = res.data;
    });
    this.searchControl.valueChanges.subscribe(() => this.applyFilters());
    this.typeFilter.valueChanges.subscribe(() => this.applyFilters());
    this.categoryFilter.valueChanges.subscribe(() => this.applyFilters());
    this.walletFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dataSource.data = res.data;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      }
    });
  }

  applyFilters(): void {
    const params: any = {};
    if (this.searchControl.value) params.search = this.searchControl.value;
    if (this.typeFilter.value) params.type = this.typeFilter.value;
    if (this.categoryFilter.value) params.category = this.categoryFilter.value;
    if (this.walletFilter.value) params.wallet = this.walletFilter.value;
    if (this.startDateFilter.value) params.startDate = this.startDateFilter.value;
    if (this.endDateFilter.value) params.endDate = this.endDateFilter.value;
    this.transactionService.getTransactions(params).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dataSource.data = res.data;
        }
      }
    });
  }

  openForm(transaction?: Transaction): void {
    const dialogRef = this.dialog.open(TransactionFormComponent, {
      width: '600px',
      data: transaction || null
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadTransactions();
    });
  }

  duplicate(transaction: Transaction): void {
    this.transactionService.duplicateTransaction(transaction._id).subscribe({
      next: () => {
        this.snackBar.open('Transaction duplicated', 'Close', { duration: 3000 });
        this.loadTransactions();
      }
    });
  }

  delete(transaction: Transaction): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Transaction', message: `Are you sure you want to delete "${transaction.title}"?`, confirmText: 'Delete', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.transactionService.deleteTransaction(transaction._id).subscribe({
          next: () => {
            this.snackBar.open('Transaction deleted', 'Close', { duration: 3000 });
            this.loadTransactions();
          }
        });
      }
    });
  }
}
