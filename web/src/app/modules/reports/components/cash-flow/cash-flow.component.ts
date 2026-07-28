import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-cash-flow',
  template: `
    <mat-card class="report-card animate-fade-in-up">
      <mat-card-header>
        <mat-card-title class="card-title premium-gradient-text">Cash Flow Report</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="filter-row animate-fade-in-up stagger-1">
          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" (dateChange)="loadReport()">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" (dateChange)="loadReport()">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
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
export class CashFlowComponent implements OnInit {
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  endDate = new Date();
  chartData: ChartData<'line'> | null = null;
  chartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } }
  };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void { this.loadReport(); }

  loadReport(): void {
    const params = {
      startDate: this.startDate.toISOString().split('T')[0],
      endDate: this.endDate.toISOString().split('T')[0]
    };
    this.reportService.getCashFlowReport(params).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.chartData = {
            labels: res.data.map((d: any) => d.date || d.label),
            datasets: [{
              data: res.data.map((d: any) => d.cumulative),
              label: 'Cumulative Cash Flow',
              borderColor: '#3f51b5',
              backgroundColor: 'rgba(63,81,181,0.2)',
              fill: true,
              tension: 0.4
            }]
          };
        }
      }
    });
  }
}
