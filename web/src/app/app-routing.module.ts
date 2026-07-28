import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'transactions',
        loadChildren: () => import('./modules/transactions/transactions.module').then(m => m.TransactionsModule)
      },
      {
        path: 'categories',
        loadChildren: () => import('./modules/categories/categories.module').then(m => m.CategoriesModule)
      },
      {
        path: 'wallets',
        loadChildren: () => import('./modules/wallets/wallets.module').then(m => m.WalletsModule)
      },
      {
        path: 'budgets',
        loadChildren: () => import('./modules/budgets/budgets.module').then(m => m.BudgetsModule)
      },
      {
        path: 'bills',
        loadChildren: () => import('./modules/bills/bills.module').then(m => m.BillsModule)
      },
      {
        path: 'savings-goals',
        loadChildren: () => import('./modules/savings-goals/savings-goals.module').then(m => m.SavingsGoalsModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('./modules/reports/reports.module').then(m => m.ReportsModule)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./modules/notifications/notifications.module').then(m => m.NotificationsModule)
      },
      {
        path: 'settings',
        loadChildren: () => import('./modules/settings/settings.module').then(m => m.SettingsModule)
      },
      {
        path: 'admin',
        canActivate: [AdminGuard],
        loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
