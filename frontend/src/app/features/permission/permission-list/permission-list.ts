import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PermissionService, PermissionListMeta } from '../../../core/services/permission.service';
import { Permission } from '../../../core/models/permission.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './permission-list.html',
  styleUrls: ['./permission-list.scss']
})
export class PermissionList implements OnInit {
  readonly limit = 10;

  loading = signal(true);
  actionLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  private successTimer: any;

  items = signal<Permission[]>([]);
  meta = signal<PermissionListMeta | null>(null);

  hasPrev = computed(() => !!this.meta() && this.meta()!.hasPrevPage);
  hasNext = computed(() => !!this.meta() && this.meta()!.hasNextPage);

  constructor(private api: PermissionService, private router: Router) {}

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
        next: res => { this.items.set(res.data); this.meta.set(res.meta); },
        error: e => this.error.set(e?.error?.error?.message || 'Failed to load permissions')
      });
  }

  changePage(p: number): void {
    const m = this.meta();
    if (!m) return;
    if (p < 1 || p > m.totalPages) return;
    this.load(p);
  }

  trackById = (_: number, p: Permission) => p._id;

  goBack(): void { this.router.navigate(['/dashboard']); }
  goCreate(): void { this.router.navigate(['/permissions/new']); }
  goDetail(id: string): void { this.router.navigate(['/permissions', id]); }
  goEdit(id: string): void { this.router.navigate(['/permissions', id, 'edit']); }

  remove(id: string, isSystem?: boolean): void {
    if (isSystem) return;
    if (!confirm('Delete this permission?')) return;

    const m = this.meta();
    const isLastItemOnPage = !!m && m.page > 1 && this.items().length === 1;
    const nextPage = isLastItemOnPage ? (m!.page - 1) : (m?.page || 1);

    this.actionLoading.set(true);
    this.error.set(null);
    this.api.remove(id)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          this.showSuccess('Permission deleted successfully');
          this.load(nextPage);
        },
        error: e => this.error.set(e?.error?.error?.message || 'Failed to delete permission')
      });
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
  }
}
