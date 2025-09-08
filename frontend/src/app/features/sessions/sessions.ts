import { Component, OnInit, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SessionsService, SessionsMeta } from '../../core/services/sessions.service';
import { AuthService } from '../../core/services/auth.service';
import { Session } from '../../core/models/session.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sessions.html',
  styleUrls: ['./sessions.scss'],
  providers: []
})
export class SessionsList implements OnInit, OnDestroy {
  readonly limit = 5;

  loading = signal(true);
  actionLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  sessions = signal<Session[]>([]);
  meta = signal<SessionsMeta | null>(null);

  hasPrev = computed(() => !!this.meta() && this.meta()!.hasPrevPage);
  hasNext = computed(() => !!this.meta() && this.meta()!.hasNextPage);

  private successTimer: any;

  constructor(
    private sessionsService: SessionsService,
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.load(1);
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.sessionsService.list(page, this.limit)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          this.sessions.set(res.data);
          this.meta.set(res.meta);
        },
        error: e => this.error.set(e.error?.error?.message || 'Failed to load sessions')
      });
  }

  private showSuccess(message: string) {
    this.success.set(message);
    clearTimeout(this.successTimer);
    this.successTimer = setTimeout(() => {
      if (this.success() === message) this.success.set(null);
    }, 2500);
  }

  sortedSessions = computed((): Session[] => {
    const list = this.sessions();
    const m = this.meta();
    if (!list.length || !m || m.page !== 1) return list;

    const currentJti = this.auth.getCurrentJti?.();
    if (!currentJti) return list;

    const idx = list.findIndex(s => s.jti && s.jti === currentJti);
    if (idx <= 0) return list;

    const curr = list[idx];
    return [curr, ...list.slice(0, idx), ...list.slice(idx + 1)];
  });

  isCurrent = (s: Session): boolean => {
    const jti = this.auth.getCurrentJti?.();
    return !!(s.jti && jti && s.jti === jti);
  };

  trackById = (_: number, s: Session) => s._id;

  revokeOne(id: string): void {
    if (!confirm('Revoke this session?')) return;
    const currentJti = this.auth.getCurrentJti();
    const target = this.sessions().find(s => s._id === id);
    const isSelf = target && target.jti && currentJti && target.jti === currentJti;

    const m = this.meta();
    const willPageBeInvalid =
      !!m && m.page > 1 && (m.total - 1) <= (m.page - 1) * m.limit;
    const nextPage = willPageBeInvalid ? (m!.page - 1) : (m?.page || 1);

    this.actionLoading.set(true);
    this.error.set(null);
    this.success.set(null);
    this.sessionsService.remove(id)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          if (isSelf) {
            this.auth.clear();
            this.router.navigate(['/auth/login']);
            return;
          }
          this.showSuccess('Session deleted');
          this.load(nextPage);
        },
        error: e => this.error.set(e.error?.error?.message || 'Failed to revoke session')
      });
  }

  revokeAll(): void {
    if (!confirm('Revoke all sessions? You will be logged out.')) return;
    this.actionLoading.set(true);
    this.error.set(null);
    this.success.set(null);
    this.sessionsService.removeAll()
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          this.auth.clear();
          this.router.navigate(['/auth/login']);
        },
        error: e => this.error.set(e.error?.error?.message || 'Failed to revoke sessions')
      });
  }

  back(): void {
    this.router.navigate(['/dashboard']);
  }

  changePage(p: number): void {
    const m = this.meta();
    if (!m) return;
    if (p < 1 || p > m.totalPages) return;
    this.load(p);
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
  }
}