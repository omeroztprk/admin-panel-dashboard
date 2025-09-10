import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ListMeta } from '../../../core/models/api.types';
import { User } from '../../../core/models/user.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserList implements OnInit, OnDestroy {
  private api = inject(UserService);
  private router = inject(Router);

  readonly limit = 10;

  loading = signal(true);
  actionLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  private successTimer: any;
  private errorTimer: any;

  users = signal<User[]>([]);
  meta = signal<ListMeta | null>(null);

  hasPrev = computed(() => !!this.meta() && this.meta()!.hasPrevPage);
  hasNext = computed(() => !!this.meta() && this.meta()!.hasNextPage);

  ngOnInit(): void {
    this.load(1);
    this.checkForSuccessMessage();
  }

  private checkForSuccessMessage(): void {
    const state = history.state;
    if (state?.success) {
      this.showSuccess(state.success);
      history.replaceState({ ...state, success: null }, '');
    }
  }

  private showSuccess(message: string): void {
    this.success.set(message);
    clearTimeout(this.successTimer);
    this.successTimer = setTimeout(() => {
      if (this.success() === message) this.success.set(null);
    }, 3000);
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list(page, this.limit)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => { this.users.set(res.data); this.meta.set(res.meta); },
        error: e => this.showError(e?.error?.error?.message || 'Failed to load users')
      });
  }

  private showError(message: string): void {
    this.error.set(message);
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      if (this.error() === message) this.error.set(null);
    }, 3000);
  }

  roleLabels(u: User): string[] {
    return Array.isArray(u.roles) ? u.roles.map(r => r.displayName || r.name) : [];
  }

  isActiveChipClass(u: User): string {
    return u.isActive ? 'chip chip--success' : 'chip chip--danger';
  }

  changePage(p: number): void {
    const m = this.meta();
    if (!m) return;
    if (p < 1 || p > m.totalPages) return;
    this.load(p);
  }

  trackById = (_: number, u: User) => u._id;

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  goCreate(): void {
    this.router.navigate(['/users/new']);
  }

  goDetail(id: string): void {
    this.router.navigate(['/users', id]);
  }

  goEdit(id: string): void {
    this.router.navigate(['/users', id, 'edit']);
  }

  remove(id: string): void {
    if (!confirm('Delete this user?')) return;
    const m = this.meta();
    const isLastItemOnPage = !!m && m.page > 1 && this.users().length === 1;
    const nextPage = isLastItemOnPage ? (m!.page - 1) : (m?.page || 1);

    this.actionLoading.set(true);
    this.error.set(null);
    this.api.remove(id)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          this.showSuccess('User deleted successfully');
          this.load(nextPage);
        },
        error: e => this.showError(e?.error?.error?.message || 'Failed to delete user')
      });
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
    if (this.errorTimer) clearTimeout(this.errorTimer);
  }
}