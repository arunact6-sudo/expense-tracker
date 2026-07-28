import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="bg-shape s1"></div>
        <div class="bg-shape s2"></div>
        <div class="bg-shape s3"></div>
        <div class="bg-shape s4"></div>
      </div>
      <div class="auth-panel animate-scale-in">
        <div class="auth-brand">
          <div class="brand-icon">
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <h1>Spendwise</h1>
          <p>Manage your finances with clarity</p>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(160deg, #0F172A 0%, #1E293B 40%, #334155 100%);
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    .auth-bg { position: absolute; inset: 0; pointer-events: none; }

    .bg-shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(79, 70, 229, 0.08);
      filter: blur(60px);
    }

    .s1 { width: 500px; height: 500px; top: -150px; right: -100px; animation: float 8s ease-in-out infinite; }
    .s2 { width: 350px; height: 350px; bottom: -80px; left: -80px; animation: float 10s ease-in-out infinite 1s; background: rgba(236, 72, 153, 0.06); }
    .s3 { width: 200px; height: 200px; top: 30%; left: 15%; animation: float 7s ease-in-out infinite 2s; background: rgba(129, 140, 248, 0.06); }
    .s4 { width: 150px; height: 150px; bottom: 30%; right: 15%; animation: float 9s ease-in-out infinite 0.5s; background: rgba(244, 114, 182, 0.05); }

    .auth-panel {
      width: 100%;
      max-width: 420px;
      background: var(--surface);
      border-radius: var(--radius-xl);
      padding: 40px 32px 36px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      position: relative;
      z-index: 1;
    }

    .auth-brand {
      text-align: center;
      margin-bottom: 32px;
    }

    .brand-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: var(--primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      color: white;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }

    .brand-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }

    .auth-brand h1 {
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.03em;
      margin-bottom: 4px;
    }

    .auth-brand p {
      font-size: 14px;
      color: var(--text-secondary);
    }
  `]
})
export class AuthLayoutComponent {}
