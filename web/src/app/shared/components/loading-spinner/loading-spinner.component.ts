import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="spinner-container" [class.fullscreen]="fullscreen" [class.inline]="!fullscreen">
      <div class="spinner-ring">
        <div class="ring ring-1"></div>
        <div class="ring ring-2"></div>
        <div class="ring ring-3"></div>
        <div class="spinner-core"></div>
      </div>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
    }

    .spinner-container.fullscreen {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(248, 250, 252, 0.88);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      z-index: 9999;
      animation: fadeIn 0.3s var(--ease-out);
    }

    .spinner-ring {
      position: relative;
      width: 52px;
      height: 52px;
    }

    .ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2.5px solid transparent;
    }

    .ring-1 {
      border-top-color: var(--primary);
      animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }

    .ring-2 {
      inset: 6px;
      border-right-color: var(--primary-light, #818CF8);
      animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse;
    }

    .ring-3 {
      inset: 12px;
      border-bottom-color: var(--accent, #EC4899);
      animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }

    .spinner-core {
      position: absolute;
      inset: 17px;
      border-radius: 50%;
      background: var(--primary);
      animation: pulse-glow 1.5s ease-in-out infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .spinner-message {
      margin-top: 20px;
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      animation: fadeIn 0.5s ease 0.3s forwards;
      opacity: 0;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() diameter = 48;
  @Input() message = '';
  @Input() fullscreen = false;
}
