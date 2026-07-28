import { Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../../core/services/settings.service';

@Pipe({ name: 'currencyFormat' })
export class CurrencyFormatPipe implements PipeTransform {
  constructor(private settingsService: SettingsService) {}

  transform(value: number, currency: string = 'USD'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return this.settingsService.formatCurrency(0, currency);
    }
    return this.settingsService.formatCurrency(value, currency);
  }
}
