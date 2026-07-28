import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Wallet, ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private walletsSubject = new BehaviorSubject<Wallet[]>([]);
  wallets$ = this.walletsSubject.asObservable();

  constructor(private api: ApiService) {}

  getWallets(): Observable<ApiResponse<Wallet[]>> {
    return this.api.get<Wallet[]>('/wallets')
      .pipe(
        tap(res => {
          if (res.success && res.data) {
            this.walletsSubject.next(res.data);
          }
        })
      );
  }

  createWallet(data: Partial<Wallet>): Observable<ApiResponse<Wallet>> {
    return this.api.post<Wallet>('/wallets', data)
      .pipe(
        tap(() => this.getWallets().subscribe())
      );
  }

  updateWallet(id: string, data: Partial<Wallet>): Observable<ApiResponse<Wallet>> {
    return this.api.put<Wallet>(`/wallets/${id}`, data)
      .pipe(
        tap(() => this.getWallets().subscribe())
      );
  }

  deleteWallet(id: string): Observable<ApiResponse<any>> {
    return this.api.delete(`/wallets/${id}`)
      .pipe(
        tap(() => this.getWallets().subscribe())
      );
  }

  transferBetweenWallets(data: { fromWallet: string; toWallet: string; amount: number; notes?: string }): Observable<ApiResponse<any>> {
    return this.api.post('/wallets/transfer', data);
  }

  getWalletSummary(): Observable<ApiResponse<any>> {
    return this.api.get('/wallets/summary');
  }
}
