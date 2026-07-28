import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-daily-report',
  template: `
    <mat-card class="report-card animate-fade-in-up">
      <mat-card-header>
        <mat-card-title class="card-title premium-gradient-text">Daily Report</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="filter-section animate-fade-in-up stagger-1">
          <mat-form-field appearance="outline">
            <mat-label>Select Date</mat-label>
            <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" (dateChange)="loadReport()">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <div class="summary-row" *ngIf="report">
          <div class="summary-item animate-fade-in-up stagger-2">
            <span class="label">Total Income</span>
            <span class="value text-success">{{ report.totalIncome | currencyFormat }}</span>
          </div>
          <div class="summary-item animate-fade-in-up stagger-3">
            <span class="label">Total Expenses</span>
            <span class="value text-danger">{{ report.totalExpenses | currencyFormat }}</span>
          </div>
          <div class="summary-item animate-fade-in-up stagger-4">
            <span class="label">Net</span>
            <span class="value" [class]="report.net >= 0 ? 'text-success' : 'text-danger'">{{ report.net | currencyFormat }}</span>
          </div>
          <div class="summary-item animate-fade-in-up stagger-5">
            <span class="label">Transactions</span>
            <span class="value">{{ report.transactionCount }}</span>
          </div>
        </div>

        <div class="chart-container animate-fade-in-up stagger-6" *ngIf="chartData">
          <canvas baseChart [data]="chartData" [type]="'bar'" [options]="chartOptions"></canvas>
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
    .filter-section {
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
export class DailyReportComponent implements OnInit {
  selectedDate = new Date();
  report: any = null;
  chartData: ChartData<'bar'> | null = null;
  chartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void { this.loadReport(); }

  loadReport(): void {
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    this.reportService.getDailyReport(dateStr).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.report = res.data;
          if (res.data.transactionsByCategory) {
            this.chartData = {
              labels: res.data.transactionsByCategory.map((c: any) => c.name),
              datasets: [{ data: res.data.transactionsByCategory.map((c: any) => c.amount), backgroundColor: res.data.transactionsByCategory.map((c: any) => c.color || '#3f51b5') }]
            };
          }
        }
      }
    });
  }
}
