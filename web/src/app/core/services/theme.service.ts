import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  currentTheme$ = this.currentThemeSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    if (saved) {
      this.setTheme(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  toggleTheme(): void {
    const current = this.currentThemeSubject.value;
    const next = current === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.currentThemeSubject.next(theme);
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  getTheme(): 'light' | 'dark' {
    return this.currentThemeSubject.value;
  }
}
