import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-monthly-report',
  template: `
    <mat-card class="report-card animate-fade-in-up">
      <mat-card-header>
        <mat-card-title class="card-title premium-gradient-text">Monthly Report</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="filter-row animate-fade-in-up stagger-1">
          <mat-form-field appearance="outline">
            <mat-label>Month</mat-label>
            <mat-select [(ngModel)]="selectedMonth" (selectionChange)="loadReport()">
              <mat-option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Year</mat-label>
            <mat-select [(ngModel)]="selectedYear" (selectionChange)="loadReport()">
              <mat-option *ngFor="let y of years" [value]="y">{{ y }}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="summary-row" *ngIf="report">
          <div class="summary-item animate-fade-in-up stagger-2">
            <span class="label">Income</span>
            <span class="value text-success">{{ report.totalIncome | currencyFormat }}</span>
          </div>
          <div class="summary-item animate-fade-in-up stagger-3">
            <span class="label">Expenses</span>
            <span class="value text-danger">{{ report.totalExpenses | currencyFormat }}</span>
          </div>
          <div class="summary-item animate-fade-in-up stagger-4">
            <span class="label">Savings</span>
            <span class="value text-info">{{ report.savings | currencyFormat }}</span>
          </div>
          <div class="summary-item animate-fade-in-up stagger-5">
            <span class="label">Transactions</span>
            <span class="value">{{ report.transactionCount }}</span>
          </div>
        </div>

        <div class="chart-container animate-fade-in-up stagger-6" *ngIf="dailyChart">
          <canvas baseChart [data]="dailyChart" [type]="'line'" [options]="lineOptions"></canvas>
        </div>

        <div class="chart-container animate-fade-in-up stagger-7" *ngIf="categoryChart" style="margin-top: 20px;">
          <canvas baseChart [data]="categoryChart" [type]="'doughnut'" [options]="doughnutOptions"></canvas>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .report-card {
      border-radius: var(--radius-lg);
      margin-top: 16px;
    }
    .card-title {
      font-size: 20px;
      font-weight: 700;
    }
    .filter-row {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    .summary-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 28px;
    }
    .summary-item {
      text-align: center;
      padding: 18px 14px;
      background: var(--bg);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      transition: transform var(--transition-spring), box-shadow var(--transition), border-color var(--transition);
    }
    .summary-item:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-sm);
      border-color: var(--primary-light);
    }
    .summary-item .label {
      display: block;
      font-size: 11px;
      color: var(--text-secondary);
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
    }
    .summary-item .value {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }
    .chart-container {
      height: 300px;
      padding: 16px;
      background: var(--bg);
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }
  `]
})
export class MonthlyReportComponent implements OnInit {
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  report: any = null;
  dailyChart: ChartData<'line'> | null = null;
  categoryChart: ChartData<'doughnut'> | null = null;
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years = [2024, 2025, 2026, 2027];
  lineOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } };
  doughnutOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void { this.loadReport(); }

  loadReport(): void {
    this.reportService.getMonthlyReport(this.selectedMonth, this.selectedYear).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.report = res.data;
          if (res.data.dailyData) {
            this.dailyChart = {
              labels: res.data.dailyData.map((d: any) => d.date),
              datasets: [
                { data: res.data.dailyData.map((d: any) => d.income), label: 'Income', borderColor: '#4caf50', fill: true, tension: 0.4 },
                { data: res.data.dailyData.map((d: any) => d.expenses), label: 'Expenses', borderColor: '#f44336', fill: true, tension: 0.4 }
              ]
            };
          }
          if (res.data.categoryBreakdown) {
            this.categoryChart = {
              labels: res.data.categoryBreakdown.map((c: any) => c.name),
              datasets: [{ data: res.data.categoryBreakdown.map((c: any) => c.amount), backgroundColor: res.data.categoryBreakdown.map((c: any) => c.color || '#3f51b5') }]
            };
          }
        }
      }
    });
  }
}
