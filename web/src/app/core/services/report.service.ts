import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DashboardStats, ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  constructor(private api: ApiService) {}

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.api.get<DashboardStats>('/reports/dashboard');
  }

  getDailyReport(date: string): Observable<ApiResponse<any>> {
    return this.api.get('/reports/daily', { date });
  }

  getWeeklyReport(date: string): Observable<ApiResponse<any>> {
    return this.api.get('/reports/weekly', { date });
  }

  getMonthlyReport(month: number, year: number): Observable<ApiResponse<any>> {
    return this.api.get('/reports/monthly', { month, year });
  }

  getYearlyReport(year: number): Observable<ApiResponse<any>> {
    return this.api.get('/reports/yearly', { year });
  }

  getCategoryReport(params: any): Observable<ApiResponse<any>> {
    return this.api.get('/reports/category', params);
  }

  getWalletReport(): Observable<ApiResponse<any>> {
    return this.api.get('/reports/wallet');
  }

  getIncomeVsExpense(params: any): Observable<ApiResponse<any>> {
    return this.api.get('/reports/income-vs-expense', params);
  }

  getCashFlowReport(params: any): Observable<ApiResponse<any>> {
    return this.api.get('/reports/cash-flow', params);
  }

  getBudgetSummary(): Observable<ApiResponse<any>> {
    return this.api.get('/reports/budget-summary');
  }
}
