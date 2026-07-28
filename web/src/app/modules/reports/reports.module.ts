import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgChartsModule } from 'ng2-charts';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportDashboardComponent } from './components/report-dashboard/report-dashboard.component';
import { DailyReportComponent } from './components/daily-report/daily-report.component';
import { MonthlyReportComponent } from './components/monthly-report/monthly-report.component';
import { CategoryReportComponent } from './components/category-report/category-report.component';
import { IncomeVsExpenseComponent } from './components/income-vs-expense/income-vs-expense.component';
import { CashFlowComponent } from './components/cash-flow/cash-flow.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    ReportDashboardComponent, DailyReportComponent, MonthlyReportComponent,
    CategoryReportComponent, IncomeVsExpenseComponent, CashFlowComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ReportsRoutingModule, SharedModule,
    MatCardModule, MatTabsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule, MatButtonModule, MatIconModule, NgChartsModule
  ]
})
export class ReportsModule {}
