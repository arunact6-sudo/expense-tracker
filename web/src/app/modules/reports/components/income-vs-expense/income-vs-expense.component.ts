import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-income-vs-expense',
  template: `
    <mat-card class="report-card animate-fade-in-up">
      <mat-card-header>
        <mat-card-title class="card-title premium-gradient-text">Income vs Expense</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="filter-row animate-fade-in-up stagger-1">
          <mat-form-field appearance="outline">
            <mat-label>Period</mat-label>
            <mat-select [(ngModel)]="period" (selectionChange)="loadReport()">
              <mat-option value="3months">Last 3 Months</mat-option>
              <mat-option value="6months">Last 6 Months</mat-option>
              <mat-option value="12months">Last 12 Months</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="chart-container animate-fade-in-up stagger-2" *ngIf="chartData">
          <canvas baseChart [data]="chartData" [type]="'line'" [options]="chartOptions"></canvas>
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
      margin-bottom: 24px;
    }
    .chart-container {
      height: 400px;
      padding: 16px;
      background: var(--bg);
      border-radius: var(--radius);
      border: 1px solid var(--border);
      transition: transform var(--transition-spring), box-shadow var(--transition);
    }
    .chart-container:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
  `]
})
export class IncomeVsExpenseComponent implements OnInit {
  period = '6months';
  chartData: ChartData<'line'> | null = null;
  chartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } }
  };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void { this.loadReport(); }

  loadReport(): void {
    this.reportService.getIncomeVsExpense({ period: this.period }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.chartData = {
            labels: res.data.map((d: any) => d.month || d.label),
            datasets: [
              { data: res.data.map((d: any) => d.income), label: 'Income', borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,0.1)', fill: true, tension: 0.4 },
              { data: res.data.map((d: any) => d.expenses), label: 'Expenses', borderColor: '#f44336', backgroundColor: 'rgba(244,67,54,0.1)', fill: true, tension: 0.4 }
            ]
          };
        }
      }
    });
  }
}
