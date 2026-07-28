import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../core/services/admin.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { CategoryFormComponent } from '../../../categories/components/category-form/category-form.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-category-management',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Category Management</h1>
      </div>

      <div class="admin-nav animate-fade-in-up stagger-1">
        <button mat-stroked-button routerLink="/admin">Dashboard</button>
        <button mat-stroked-button routerLink="/admin/users">Users</button>
        <button mat-stroked-button routerLink="/admin/categories" routerLinkActive="active-nav">Categories</button>
      </div>

      <div class="category-grid">
        <mat-card *ngFor="let category of categories; let i = index"
          class="category-card animate-fade-in-up"
          [class]="'stagger-' + (i % 8 + 1)">
          <div class="category-icon" [style.background]="category.color + '18'">
            <mat-icon [style.color]="category.color">{{ category.icon }}</mat-icon>
          </div>
          <div class="category-info">
            <h3>{{ category.name }}</h3>
            <span class="category-meta">{{ category.type | titlecase }} &middot; {{ category.isSystem ? 'System' : 'Custom' }}</span>
          </div>
          <div class="category-actions" *ngIf="!category.isSystem">
            <button mat-icon-button class="action-btn edit-btn" (click)="editCategory(category)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" class="action-btn delete-btn" (click)="deleteCategory(category)"><mat-icon>delete</mat-icon></button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-nav {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }
    .admin-nav button {
      border-radius: var(--radius) !important;
      font-weight: 500 !important;
      transition: transform var(--transition-spring), box-shadow var(--transition), background var(--transition) !important;
    }
    .admin-nav button:hover {
      transform: translateY(-2px) !important;
      box-shadow: var(--shadow-sm) !important;
    }
    .category-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 14px;
    }
    .category-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px !important;
      border-radius: var(--radius-lg) !important;
      transition: transform var(--transition-spring), box-shadow var(--transition), border-color var(--transition) !important;
    }
    .category-card:hover {
      transform: translateY(-3px) !important;
      box-shadow: var(--shadow-lg) !important;
      border-color: var(--primary-light) !important;
    }
    .category-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform var(--transition-spring);
    }
    .category-card:hover .category-icon {
      transform: scale(1.1) rotate(-5deg);
    }
    .category-info {
      flex: 1;
    }
    .category-info h3 {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .category-meta {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .category-actions {
      display: flex;
      gap: 4px;
    }
    .action-btn {
      transition: transform var(--transition-spring) !important;
    }
    .action-btn:hover {
      transform: scale(1.15) !important;
    }
  `]
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];

  constructor(
    private adminService: AdminService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadCategories(); }

  loadCategories(): void {
    this.adminService.getAllCategories().subscribe({
      next: (res) => { if (res.success && res.data) this.categories = res.data; }
    });
  }

  editCategory(category: Category): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, { width: '400px', data: category });
    dialogRef.afterClosed().subscribe(result => { if (result) this.loadCategories(); });
  }

  deleteCategory(category: Category): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Category', message: `Delete "${category.name}"?`, confirmText: 'Delete', confirmColor: 'warn' }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.categoryService.deleteCategory(category._id).subscribe({
          next: () => { this.snackBar.open('Category deleted', 'Close', { duration: 3000 }); this.loadCategories(); }
        });
      }
    });
  }
}
