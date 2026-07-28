import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Budget, ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private budgetsSubject = new BehaviorSubject<Budget[]>([]);
  budgets$ = this.budgetsSubject.asObservable();

  constructor(private api: ApiService) {}

  getBudgets(): Observable<ApiResponse<Budget[]>> {
    return this.api.get<Budget[]>('/budgets')
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this.budgetsSubject.next(res.data);
          }
        })
      );
  }

  createBudget(data: Partial<Budget>): Observable<ApiResponse<Budget>> {
    return this.api.post<Budget>('/budgets', data)
      .pipe(
        tap(() => this.getBudgets().subscribe())
      );
  }

  updateBudget(id: string, data: Partial<Budget>): Observable<ApiResponse<Budget>> {
    return this.api.put<Budget>(`/budgets/${id}`, data)
      .pipe(
        tap(() => this.getBudgets().subscribe())
      );
  }

  deleteBudget(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/budgets/${id}`)
      .pipe(
        tap(() => this.getBudgets().subscribe())
      );
  }

  getBudgetProgress(): Observable<ApiResponse<any>> {
    return this.api.get('/budgets/progress');
  }

  checkBudgetAlerts(): Observable<ApiResponse<any>> {
    return this.api.get('/budgets/alerts');
  }
}
