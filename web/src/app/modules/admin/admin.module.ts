import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { CategoryManagementComponent } from './components/category-management/category-management.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AdminDashboardComponent, UserManagementComponent, CategoryManagementComponent],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule, AdminRoutingModule, SharedModule,
    MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatSlideToggleModule,
    MatFormFieldModule, MatInputModule, MatPaginatorModule, MatTabsModule, MatTooltipModule, MatChipsModule
  ]
})
export class AdminModule {}
