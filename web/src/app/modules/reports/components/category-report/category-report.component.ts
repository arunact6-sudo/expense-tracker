import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { ReportService } from '../../../../core/services/report.service';

@Component({
  selector: 'app-category-report',
  template: `
    <mat-card class="report-card animate-fade-in-up">
      <mat-card-header>
        <mat-card-title class="card-title premium-gradient-text">Category Report</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="filter-row animate-fade-in-up stagger-1">
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="type" (selectionChange)="loadReport()">
              <mat-option value="expense">Expense</mat-option>
              <mat-option value="income">Income</mat-option>
            </mat-select>
          </mat-form-field>
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

        <div class="charts-row">
          <div class="chart-container animate-fade-in-up stagger-2">
            <canvas baseChart *ngIf="barChart" [data]="barChart" [type]="'bar'" [options]="barOptions"></canvas>
          </div>
          <div class="chart-container animate-fade-in-up stagger-3">
            <canvas baseChart *ngIf="pieChart" [data]="pieChart" [type]="'pie'" [options]="pieOptions"></canvas>
          </div>
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
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .chart-container {
      height: 350px;
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
export class CategoryReportComponent implements OnInit {
  type = 'expense';
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  endDate = new Date();
  barChart: ChartData<'bar'> | null = null;
  pieChart: ChartData<'pie'> | null = null;
  barOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false, indexAxis: 'y' };
  pieOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } };

  constructor(private reportService: ReportService) {}

  ngOnInit(): void { this.loadReport(); }

  loadReport(): void {
    const params = {
      type: this.type,
      startDate: this.startDate.toISOString().split('T')[0],
      endDate: this.endDate.toISOString().split('T')[0]
    };
    this.reportService.getCategoryReport(params).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const labels = res.data.map((c: any) => c.name);
          const data = res.data.map((c: any) => c.amount);
          const colors = res.data.map((c: any) => c.color || '#3f51b5');
          this.barChart = { labels, datasets: [{ data, backgroundColor: colors, label: this.type === 'expense' ? 'Expenses' : 'Income' }] };
          this.pieChart = { labels, datasets: [{ data, backgroundColor: colors }] };
        }
      }
    });
  }
}
