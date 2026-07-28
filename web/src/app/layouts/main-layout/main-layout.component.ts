import { Component, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <!-- SIDEBAR -->
      <mat-sidenav
        #sidenav
        [mode]="isMobile ? 'over' : 'side'"
        [opened]="!isMobile"
        class="sidenav"
        [fixedInViewport]="isMobile">

        <div class="sidenav-inner">
          <!-- Brand Logo & Title -->
          <div class="brand">
            <div class="brand-logo">
              <mat-icon>account_balance_wallet</mat-icon>
            </div>
            <div class="brand-info">
              <span class="brand-name">Spendwise</span>
              <span class="brand-sub">Personal Finance</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="nav-area">
            <div *ngFor="let section of navSections" class="nav-section">
              <span class="section-title">{{ section.label }}</span>
              <a *ngFor="let item of section.items"
                [routerLink]="item.route"
                routerLinkActive="active-link"
                (click)="closeSidenav()"
                class="nav-item">
                <div class="nav-icon-box">
                  <mat-icon>{{ item.icon }}</mat-icon>
                </div>
                <span class="nav-text">{{ item.label }}</span>
                <span *ngIf="item.badge" class="nav-badge">{{ item.badge > 9 ? '9+' : item.badge }}</span>
              </a>
            </div>
          </nav>

          <!-- Sidebar Footer User Profile -->
          <div class="sidenav-footer">
            <div class="footer-user">
              <div class="footer-avatar">
                {{ currentUser?.name?.charAt(0) || 'U' }}
              </div>
              <div class="footer-info">
                <span class="footer-name">{{ currentUser?.name || 'User' }}</span>
                <span class="footer-role">{{ isAdmin ? 'Admin' : 'Member' }}</span>
              </div>
              <button mat-icon-button [matMenuTriggerFor]="sideMenu" class="footer-more" aria-label="User Menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #sideMenu="matMenu" xPosition="before" class="glass-menu">
                <button mat-menu-item routerLink="/settings">
                  <mat-icon>person_outline</mat-icon><span>Profile</span>
                </button>
                <button mat-menu-item (click)="toggleTheme()">
                  <mat-icon>{{ (themeService.currentTheme$ | async) === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
                  <span>{{ (themeService.currentTheme$ | async) === 'dark' ? 'Light Mode' : 'Dark Mode' }}</span>
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logout()" class="signout-btn">
                  <mat-icon>logout</mat-icon><span>Sign Out</span>
                </button>
              </mat-menu>
            </div>
          </div>
        </div>
      </mat-sidenav>

      <!-- MAIN CONTENT WRAPPER -->
      <mat-sidenav-content>
        <!-- Top Navbar -->
        <header class="topbar" [class.scrolled]="isScrolled">
          <div class="topbar-inner">
            <div class="topbar-left">
              <button mat-icon-button (click)="sidenav.toggle()" class="menu-toggle" aria-label="Toggle Navigation">
                <mat-icon>menu</mat-icon>
              </button>
              <h1 class="page-heading">{{ getCurrentPageName() }}</h1>
            </div>

            <div class="topbar-right">
              <button mat-icon-button (click)="toggleTheme()" class="topbar-icon" matTooltip="Toggle theme">
                <mat-icon>{{ (themeService.currentTheme$ | async) === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
              </button>

              <button mat-icon-button routerLink="/notifications" class="topbar-icon notif-wrap" matTooltip="Notifications">
                <mat-icon [class.bell-active]="unreadCount > 0">notifications_none</mat-icon>
                <span class="notif-dot" *ngIf="unreadCount > 0"></span>
              </button>

              <div class="topbar-divider"></div>

              <button mat-button [matMenuTriggerFor]="userMenu" class="profile-chip">
                <div class="avatar-sm">{{ currentUser?.name?.charAt(0) || 'U' }}</div>
                <span class="chip-name" *ngIf="!isMobile">{{ currentUser?.name || 'User' }}</span>
                <mat-icon class="chip-arrow">expand_more</mat-icon>
              </button>

              <mat-menu #userMenu="matMenu" xPosition="before" class="glass-menu">
                <div class="dropdown-profile">
                  <div class="dp-avatar">{{ currentUser?.name?.charAt(0) || 'U' }}</div>
                  <div class="dp-text">
                    <span class="dp-name">{{ currentUser?.name || 'User' }}</span>
                    <span class="dp-email">{{ currentUser?.email || '' }}</span>
                  </div>
                </div>
                <mat-divider></mat-divider>
                <button mat-menu-item routerLink="/settings"><mat-icon>person_outline</mat-icon><span>My Profile</span></button>
                <button mat-menu-item routerLink="/settings"><mat-icon>tune</mat-icon><span>Preferences</span></button>
                <mat-divider></mat-divider>
                <button mat-menu-item (click)="logout()" class="signout-btn"><mat-icon>logout</mat-icon><span>Sign Out</span></button>
              </mat-menu>
            </div>
          </div>
          <div class="progress-track"><div class="progress-bar" [style.width.%]="scrollProgress"></div></div>
        </header>

        <!-- Dynamic Body Outlet -->
        <main class="page-body">
          <router-outlet></router-outlet>
        </main>

        <!-- Mobile Bottom Tab Navigation -->
        <nav class="mob-tab-bar" *ngIf="isMobile">
          <a *ngFor="let b of bottomNav" [routerLink]="b.route" routerLinkActive="mob-active" class="mob-tab">
            <mat-icon>{{ b.icon }}</mat-icon>
            <span>{{ b.label }}</span>
          </a>
        </nav>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    /* ===================================
       THEME VARIABLES & LAYOUT SETUP
       =================================== */
    :host {
      --primary: #6366F1;
      --primary-50: rgba(99, 102, 241, 0.08);
      --primary-100: rgba(99, 102, 241, 0.15);
      --surface: #ffffff;
      --bg-secondary: #f8fafc;
      --border: #e2e8f0;
      --text: #0f172a;
      --text-secondary: #475569;
      --text-tertiary: #94a3b8;
      --warn: #ef4444;
      --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    }

    .layout-container {
      height: 100vh;
      background: var(--bg-secondary);
    }

    /* ===================================
       SIDEBAR DESIGN & ANIMATIONS
       =================================== */
    .sidenav {
      width: 260px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      overflow: hidden;
    }

    .sidenav-inner {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px 20px;
    }

    .brand-logo {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
      flex-shrink: 0;
      animation: brandPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .brand-logo mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
    }

    .brand-info {
      display: flex;
      flex-direction: column;
      animation: slideIn 0.4s var(--ease-out) 0.1s both;
    }

    .brand-name {
      font-size: 18px;
      font-weight: 800;
      color: var(--text);
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .brand-sub {
      font-size: 11px;
      color: var(--text-tertiary);
      font-weight: 500;
    }

    /* Navigation Items */
    .nav-area {
      flex: 1;
      overflow-y: auto;
      padding: 8px 12px;
    }

    .nav-area::-webkit-scrollbar { width: 4px; }
    .nav-area::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

    .nav-section { margin-bottom: 12px; }

    .section-title {
      display: block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-tertiary);
      padding: 8px 12px;
      user-select: none;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 44px;
      margin-bottom: 4px;
      border-radius: 10px;
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      padding: 0 12px;
      text-decoration: none;
      position: relative;
      transition: all 0.25s var(--ease-out);
    }

    .nav-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.25s var(--ease-out);
    }

    .nav-icon-box mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--text-tertiary);
      transition: color 0.25s var(--ease-out);
    }

    .nav-text { flex: 1; }

    .nav-badge {
      padding: 2px 6px;
      border-radius: 10px;
      background: var(--warn);
      color: white;
      font-size: 10px;
      font-weight: 700;
    }

    .nav-item:hover {
      background: var(--bg-secondary);
      color: var(--text);
    }

    .nav-item:hover .nav-icon-box {
      background: var(--primary-50);
    }

    .nav-item:hover .nav-icon-box mat-icon {
      color: var(--primary);
    }

    .active-link {
      background: var(--primary-50) !important;
      color: var(--primary) !important;
      font-weight: 600 !important;
    }

    .active-link .nav-icon-box {
      background: var(--primary);
      box-shadow: 0 3px 10px rgba(99, 102, 241, 0.3);
    }

    .active-link .nav-icon-box mat-icon {
      color: #ffffff !important;
    }

    /* Footer Profile */
    .sidenav-footer {
      padding: 12px;
      border-top: 1px solid var(--border);
    }

    .footer-user {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: 10px;
      transition: background 0.2s ease;
    }

    .footer-user:hover { background: var(--bg-secondary); }

    .footer-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366F1, #EC4899);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .footer-info { flex: 1; min-width: 0; }

    .footer-name {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .footer-role {
      display: block;
      font-size: 11px;
      color: var(--text-tertiary);
    }

    /* ===================================
       TOPBAR & GLASSMORPHISM
       =================================== */
    .topbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border-bottom: 1px solid transparent;
      transition: all 0.3s var(--ease-out);
    }

    .topbar.scrolled {
      border-bottom-color: var(--border);
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }

    .topbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      padding: 0 24px;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .menu-toggle {
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    }

    .menu-toggle:hover { transform: rotate(90deg); }

    .page-heading {
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .topbar-icon {
      color: var(--text-secondary) !important;
      transition: all 0.2s var(--ease-out) !important;
    }

    .topbar-icon:hover {
      color: var(--text) !important;
      background: var(--bg-secondary) !important;
    }

    .notif-wrap { position: relative; }

    .bell-active {
      animation: bellWiggle 3s ease-in-out infinite;
    }

    .notif-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--warn);
      border: 2px solid var(--surface);
      animation: dotPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .topbar-divider {
      width: 1px;
      height: 20px;
      background: var(--border);
      margin: 0 8px;
    }

    .profile-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px !important;
      border-radius: 12px !important;
      transition: background 0.2s var(--ease-out) !important;
    }

    .profile-chip:hover {
      background: var(--bg-secondary) !important;
    }

    .avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366F1, #818CF8);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
    }

    .chip-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text);
    }

    .chip-arrow {
      color: var(--text-tertiary) !important;
      transition: transform 0.3s var(--ease-out) !important;
    }

    .profile-chip:hover .chip-arrow { transform: rotate(180deg); }

    .dropdown-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
    }

    .dp-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366F1, #818CF8);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }

    .dp-text { display: flex; flex-direction: column; }
    .dp-name { font-size: 14px; font-weight: 600; color: var(--text); }
    .dp-email { font-size: 12px; color: var(--text-secondary); }
    .signout-btn { color: var(--warn) !important; }

    /* Scroll progress indicator */
    .progress-track { height: 2px; width: 100%; background: transparent; }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6366F1, #EC4899);
      transition: width 0.1s linear;
    }

    /* Body Outlet */
    .page-body {
      min-height: calc(100vh - 64px);
    }

    /* Mobile Bottom Navigation Bar */
    .mob-tab-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 1000;
    }

    .mob-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: var(--text-tertiary);
      font-size: 10px;
      font-weight: 600;
      gap: 2px;
      transition: color 0.25s var(--ease-out);
    }

    .mob-tab mat-icon { font-size: 22px; width: 22px; height: 22px; transition: transform 0.25s var(--ease-out); }
    .mob-active { color: var(--primary) !important; }
    .mob-active mat-icon { transform: translateY(-2px) scale(1.1); }

    /* KEYFRAME ANIMATIONS */
    @keyframes brandPop {
      0% { opacity: 0; transform: scale(0.6) rotate(-10deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }

    @keyframes slideIn {
      0% { opacity: 0; transform: translateX(-8px); }
      100% { opacity: 1; transform: translateX(0); }
    }

    @keyframes bellWiggle {
      0%, 90%, 100% { transform: rotate(0); }
      92% { transform: rotate(12deg); }
      94% { transform: rotate(-10deg); }
      96% { transform: rotate(6deg); }
      98% { transform: rotate(-4deg); }
    }

    @keyframes dotPop {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }

    @media (max-width: 768px) {
      .page-body { padding-bottom: 60px; }
      .topbar-inner { padding: 0 16px; }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  currentUser: User | null = null;
  unreadCount = 0;
  isMobile = false;
  isAdmin = false;
  isScrolled = false;
  scrollProgress = 0;

  navSections: NavSection[] = [
    {
      label: 'Overview',
      items: [
        { icon: 'space_dashboard', label: 'Dashboard', route: '/dashboard' },
        { icon: 'receipt_long', label: 'Transactions', route: '/transactions' },
        { icon: 'category', label: 'Categories', route: '/categories' },
        { icon: 'account_balance_wallet', label: 'Wallets', route: '/wallets' }
      ]
    },
    {
      label: 'Finance',
      items: [
        { icon: 'savings', label: 'Budgets', route: '/budgets' },
        { icon: 'receipt', label: 'Bills', route: '/bills' },
        { icon: 'flag', label: 'Savings Goals', route: '/savings-goals' },
        { icon: 'bar_chart', label: 'Reports', route: '/reports' }
      ]
    },
    {
      label: 'Account',
      items: [
        { icon: 'notifications_none', label: 'Notifications', route: '/notifications', badge: 0 },
        { icon: 'settings', label: 'Settings', route: '/settings' },
        { icon: 'admin_panel_settings', label: 'Admin', route: '/admin' }
      ]
    }
  ];

  bottomNav = [
    { icon: 'space_dashboard', label: 'Home', route: '/dashboard' },
    { icon: 'receipt_long', label: 'Trans', route: '/transactions' },
    { icon: 'account_balance_wallet', label: 'Wallets', route: '/wallets' },
    { icon: 'bar_chart', label: 'Reports', route: '/reports' },
    { icon: 'settings', label: 'More', route: '/settings' }
  ];

  private subs: Subscription[] = [];

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private notificationService: NotificationService,
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isAdmin = user?.role === 'admin';
      }),
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
        const notifItem = this.navSections[2]?.items?.find(i => i.route === '/notifications');
        if (notifItem) notifItem.badge = count;
      }),
      this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
        this.isMobile = result.matches;
      }),
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        if (this.isMobile && this.sidenav) {
          this.sidenav.close();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
    );
    this.notificationService.startPolling();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 10;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.notificationService.stopPolling();
  }

  getCurrentPageName(): string {
    const url = this.router.url;
    const segments = url.split('/').filter(Boolean);
    const page = segments[segments.length - 1] || 'dashboard';
    return page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' ');
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  closeSidenav(): void {
    if (this.isMobile && this.sidenav) {
      this.sidenav.close();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}