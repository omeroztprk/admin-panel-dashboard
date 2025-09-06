import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SessionsService } from '../../core/services/sessions.service';
import { AuthService } from '../../core/services/auth.service';
import { Session } from '../../core/models/session.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sessions.html',
  styleUrls: ['./sessions.scss']
})
export class SessionsList implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  actionLoading = signal(false);
  
  sessions = signal<Session[]>([]);
  pagination = signal<any>(null);
  
  constructor(
    private sessionsService: SessionsService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(page = 1): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.sessionsService.list(page, 20).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (result) => {
        this.sessions.set(result.data);
        this.pagination.set(result.pagination || null);
      },
      error: (e) => this.error.set(e.error?.error?.message || 'Failed to load sessions')
    });
  }

  removeSession(sessionId: string): void {
    if (!confirm('Are you sure you want to revoke this session?')) return;

    const currentJti = this.auth.getCurrentJti();
    const target = this.sessions().find(s => s._id === sessionId);
    const isSelf = target && target.jti && currentJti && target.jti === currentJti;

    this.actionLoading.set(true);
    this.error.set(null);

    this.sessionsService.remove(sessionId).pipe(
      finalize(() => this.actionLoading.set(false))
    ).subscribe({
      next: () => {
        if (isSelf) {
          this.auth.clear();
          this.router.navigate(['/auth/login']);
          return;
        }
        this.success.set('Session revoked successfully');
        this.loadSessions(this.pagination()?.page || 1);
        setTimeout(() => this.success.set(null), 2500);
      },
      error: (e) => {
        this.error.set(e.error?.error?.message || 'Failed to revoke session');
      }
    });
  }

  removeAllSessions(): void {
    if (!confirm('Are you sure you want to revoke all sessions? You will be logged out.')) return;
    
    this.actionLoading.set(true);
    this.error.set(null);
    
    this.sessionsService.removeAll().pipe(
      finalize(() => this.actionLoading.set(false))
    ).subscribe({
      next: () => {
        this.auth.clear();
        this.router.navigate(['/auth/login']);
      },
      error: (e) => this.error.set(e.error?.error?.message || 'Failed to revoke sessions')
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString();
  }

  getBrowserName(userAgent?: string): string {
    if (!userAgent) return 'Unknown';
    const ua = userAgent.toLowerCase();

    if (ua.includes('postmanruntime')) return 'Postman';
    if (ua.startsWith('curl/')) return 'cURL';
    if (ua.includes('insomnia')) return 'Insomnia';
    if (ua.includes('axios')) return 'Axios';

    if (ua.includes('edg/')) return 'Edge';
    if (ua.includes('opr/') || ua.includes('opera')) return 'Opera';
    if (ua.includes('brave')) return 'Brave';
    if (ua.includes('firefox/')) return 'Firefox';
    if (ua.includes('safari/') && !ua.includes('chrome') && !ua.includes('chromium')) return 'Safari';
    if (ua.includes('chrome/') && !ua.includes('edg/')) return 'Chrome';
    if (ua.includes('chromium')) return 'Chromium';

    return 'Unknown';
  }

  getDeviceType(userAgent?: string): string {
    if (!userAgent) return 'Unknown';
    const ua = userAgent.toLowerCase();
    if (ua.includes('postmanruntime') || ua.startsWith('curl/') || ua.includes('insomnia') || ua.includes('axios')) {
      return 'API Client';
    }
    if (ua.includes('tablet')) return 'Tablet';
    if (ua.match(/mobile|iphone|android/i)) return 'Mobile';
    return 'Desktop';
  }

  changePage(page: number): void {
    this.loadSessions(page);
  }
}