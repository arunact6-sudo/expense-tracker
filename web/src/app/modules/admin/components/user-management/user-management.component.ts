import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AdminService } from '../../../../core/services/admin.service';
import { User } from '../../../../core/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-management',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>User Management</h1>
      </div>

      <div class="admin-nav animate-fade-in-up stagger-1">
        <button mat-stroked-button routerLink="/admin">Dashboard</button>
        <button mat-stroked-button routerLink="/admin/users" routerLinkActive="active-nav">Users</button>
        <button mat-stroked-button routerLink="/admin/categories" routerLinkActive="active-nav">Categories</button>
      </div>

      <mat-card class="table-card animate-fade-in-up stagger-2">
        <div class="table-wrapper">
          <table mat-table [dataSource]="dataSource">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let user">{{ user.name }}</td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let user">
                <span class="role-badge" [class]="'role-' + user.role">{{ user.role }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="lastLogin">
              <th mat-header-cell *matHeaderCellDef>Last Login</th>
              <td mat-cell *matCellDef="let user">{{ user.lastLogin | date:'medium' }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let user">
                <mat-slide-toggle [checked]="user.isActive" (change)="toggleUserStatus(user)" color="primary">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </mat-slide-toggle>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </mat-card>
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
    .table-card {
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .table-wrapper {
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
    .mat-mdc-header-row {
      background: var(--bg);
    }
    .mat-mdc-header-cell {
      font-weight: 700 !important;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-secondary) !important;
      border-bottom: 2px solid var(--border) !important;
      padding: 14px 16px !important;
    }
    .mat-mdc-cell {
      padding: 14px 16px !important;
      border-bottom: 1px solid var(--border) !important;
      transition: background var(--transition);
    }
    .mat-mdc-row:hover .mat-mdc-cell {
      background: rgba(92, 107, 192, 0.04);
    }
    .role-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 14px;
      border-radius: var(--radius-full);
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
      letter-spacing: 0.3px;
    }
    .role-admin {
      background: linear-gradient(135deg, rgba(156,39,176,0.12), rgba(156,39,176,0.04));
      color: #9c27b0;
    }
    .role-user {
      background: linear-gradient(135deg, rgba(33,150,243,0.12), rgba(33,150,243,0.04));
      color: #2196f3;
    }
  `]
})
export class UserManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns = ['name', 'email', 'role', 'lastLogin', 'status'];
  dataSource = new MatTableDataSource<User>();

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dataSource.data = res.data;
          this.dataSource.paginator = this.paginator;
        }
      }
    });
  }

  toggleUserStatus(user: User): void {
    this.adminService.updateUserStatus(user._id, !user.isActive).subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.snackBar.open(`User ${user.isActive ? 'activated' : 'deactivated'}`, 'Close', { duration: 3000 });
      },
      error: () => { user.isActive = !user.isActive; }
    });
  }
}
