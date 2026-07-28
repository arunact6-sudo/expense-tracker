import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Transaction, ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  transactions$ = this.transactionsSubject.asObservable();

  constructor(private api: ApiService) {}

  getTransactions(params: any = {}): Observable<ApiResponse<Transaction[]>> {
    return this.api.get<Transaction[]>('/transactions', params)
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this.transactionsSubject.next(res.data);
          }
        })
      );
  }

  getTransaction(id: string): Observable<ApiResponse<Transaction>> {
    return this.api.get<Transaction>(`/transactions/${id}`);
  }

  createTransaction(data: Partial<Transaction>): Observable<ApiResponse<Transaction>> {
    return this.api.post<Transaction>('/transactions', data);
  }

  updateTransaction(id: string, data: Partial<Transaction>): Observable<ApiResponse<Transaction>> {
    return this.api.put<Transaction>(`/transactions/${id}`, data);
  }

  deleteTransaction(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/transactions/${id}`);
  }

  duplicateTransaction(id: string): Observable<ApiResponse<Transaction>> {
    return this.api.post<Transaction>(`/transactions/${id}/duplicate`, {});
  }

  bulkDelete(ids: string[]): Observable<ApiResponse<any>> {
    return this.api.post('/transactions/bulk-delete', { ids });
  }

  searchTransactions(query: string, filters: any = {}): Observable<ApiResponse<Transaction[]>> {
    return this.api.get<Transaction[]>('/transactions/search', { q: query, ...filters });
  }

  getTransactionsByDateRange(start: string, end: string): Observable<ApiResponse<Transaction[]>> {
    return this.api.get<Transaction[]>('/transactions', { startDate: start, endDate: end });
  }
}
