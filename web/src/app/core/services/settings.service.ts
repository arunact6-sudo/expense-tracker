import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CNY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    BRL: 'R$'
  };

  constructor(private api: ApiService) {}

  getSettings(): Observable<ApiResponse<any>> {
    return this.api.get('/settings');
  }

  updateSettings(data: any): Observable<ApiResponse<any>> {
    return this.api.put('/settings', data);
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    const symbol = this.currencySymbols[currency] || '$';
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getCurrencySymbol(currency: string): string {
    return this.currencySymbols[currency] || '$';
  }
}
