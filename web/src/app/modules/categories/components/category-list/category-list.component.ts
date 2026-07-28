import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/user.model';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-category-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Categories</h1>
        <button mat-raised-button color="primary" class="btn-premium-raised" (click)="openForm()">
          <mat-icon>add</mat-icon> Add Category
        </button>
      </div>

      <mat-tab-group class="premium-tabs" (selectedTabChange)="onTabChange($event.index)" animationDuration="200ms">
        <mat-tab label="All"></mat-tab>
        <mat-tab label="Income"></mat-tab>
        <mat-tab label="Expense"></mat-tab>
      </mat-tab-group>

      <div class="category-grid">
        <mat-card *ngFor="let category of filteredCategories; let i = index"
          class="category-card animate-fade-in-up"
          [class]="'category-card animate-fade-in-up stagger-' + (i + 1)"
          [style.--accent-color]="category.color"
          appHighlight>
          <div class="category-icon" [style.background]="category.color + '18'" [style.color]="category.color">
            <mat-icon>{{ category.icon }}</mat-icon>
          </div>
          <div class="category-info">
            <h3>{{ category.name }}</h3>
            <span class="category-type">{{ category.type | titlecase }}</span>
          </div>
          <div class="category-actions" *ngIf="!category.isSystem">
            <button mat-icon-button (click)="openForm(category)" matTooltip="Edit">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteCategory(category)" matTooltip="Delete">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
          <div class="system-badge" *ngIf="category.isSystem">
            <mat-icon>lock</mat-icon> System
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
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
      color: var(--text, #1A2138);
      letter-spacing: -0.5px;
    }

    .btn-premium-raised {
      border-radius: var(--radius, 10px) !important;
      font-weight: 600 !important;
      padding: 0 24px !important;
      height: 42px !important;
      box-shadow: var(--shadow-sm) !important;
      transition: box-shadow var(--transition-fast), transform var(--transition-fast) !important;
    }

    .btn-premium-raised:hover {
      box-shadow: var(--shadow-md) !important;
      transform: translateY(-2px) !important;
    }

    .premium-tabs {
      margin-bottom: 8px;
    }

    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 20px;
    }

    .category-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border-radius: var(--radius-lg, 14px);
      border: 1px solid var(--border, #E4E9F2);
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06));
      cursor: pointer;
      opacity: 0;
      background: var(--surface, #fff);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
    }

    .category-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08));
      border-color: var(--primary-light, #9FA8DA);
    }

    .category-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md, 12px);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .category-icon mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .category-info {
      flex: 1;
      min-width: 0;
    }

    .category-info h3 {
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 2px 0;
      color: var(--text, #1A2138);
      letter-spacing: -0.2px;
    }

    .category-type {
      font-size: 11px;
      color: var(--text-secondary, #6B7A99);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-weight: 500;
    }

    .category-actions {
      display: flex;
      gap: 2px;
      opacity: 0.5;
      transition: opacity var(--transition-fast);
    }

    .category-card:hover .category-actions {
      opacity: 1;
    }

    .system-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--text-tertiary, #8E99B3);
      background: var(--bg-secondary, #F5F6FA);
      padding: 4px 10px;
      border-radius: var(--radius-full, 9999px);
      font-weight: 500;
      letter-spacing: 0.3px;
    }

    .system-badge mat-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
    }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  activeTab = 0;

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categories = res.data;
          this.filterByTab();
        }
      }
    });
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    this.filterByTab();
  }

  filterByTab(): void {
    if (this.activeTab === 0) {
      this.filteredCategories = [...this.categories];
    } else if (this.activeTab === 1) {
      this.filteredCategories = this.categories.filter(c => c.type === 'income' || c.type === 'both');
    } else {
      this.filteredCategories = this.categories.filter(c => c.type === 'expense' || c.type === 'both');
    }
  }

  openForm(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '400px',
      data: category || null
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadCategories();
    });
  }

  deleteCategory(category: Category): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Category', message: `Delete "${category.name}"?`, confirmText: 'Delete', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.categoryService.deleteCategory(category._id).subscribe({
          next: () => {
            this.snackBar.open('Category deleted', 'Close', { duration: 3000 });
            this.loadCategories();
          }
        });
      }
    });
  }
}
