import { Component, OnInit, signal, computed, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SessionsService } from '../../core/services/sessions.service';
import { AuthService } from '../../core/services/auth.service';
import { Session } from '../../core/models/session.model';
import { ListMeta } from '../../core/models/api.types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './session-list.html',
  styleUrls: ['./session-list.scss'],
  providers: []
})
export class SessionList implements OnInit, OnDestroy {
  readonly limit = 5;
  private sessionsService = inject(SessionsService);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(true);
  actionLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  sessions = signal<Session[]>([]);
  meta = signal<ListMeta | null>(null);

  hasPrev = computed(() => !!this.meta() && this.meta()!.hasPrevPage);
  hasNext = computed(() => !!this.meta() && this.meta()!.hasNextPage);

  private successTimer: any;
  private errorTimer: any;

  constructor() { }

  ngOnInit(): void {
    this.load(1);
  }

  private showSuccess(message: string) {
    this.success.set(message);
    clearTimeout(this.successTimer);
    this.successTimer = setTimeout(() => {
      if (this.success() === message) this.success.set(null);
    }, 3000);
  }

  private showError(message: string): void {
    this.error.set(message);
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      if (this.error() === message) this.error.set(null);
    }, 3000);
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
        error: e => this.showError(e.error?.error?.message || 'Failed to load sessions')
      });
  }

  sortedSessions = computed((): Session[] => {
    const list = this.sessions();
    const m = this.meta();
    if (!list.length || !m || m.page !== 1) return list;

    const currentJti = this.auth.getCurrentJti();
    if (!currentJti) return list;

    const idx = list.findIndex(s => s.jti && s.jti === currentJti);
    if (idx <= 0) return list;

    const curr = list[idx];
    return [curr, ...list.slice(0, idx), ...list.slice(idx + 1)];
  });

  isCurrent = (s: Session): boolean => {
    const jti = this.auth.getCurrentJti();
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
        error: e => this.showError(e.error?.error?.message || 'Failed to revoke session')
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
        error: e => this.showError(e.error?.error?.message || 'Failed to revoke sessions')
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
    if (this.errorTimer) clearTimeout(this.errorTimer);
  }
}