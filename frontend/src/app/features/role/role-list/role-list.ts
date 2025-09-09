import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RoleService, RoleListMeta } from '../../../core/services/role.service';
import { Role } from '../../../core/models/role.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './role-list.html',
  styleUrls: ['./role-list.scss']
})
export class RoleList implements OnInit {
  readonly limit = 10;

  loading = signal(true);
  actionLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  private successTimer: any;

  roles = signal<Role[]>([]);
  meta = signal<RoleListMeta | null>(null);

  hasPrev = computed(() => !!this.meta() && this.meta()!.hasPrevPage);
  hasNext = computed(() => !!this.meta() && this.meta()!.hasNextPage);

  constructor(private api: RoleService, private router: Router) { }

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
        next: res => { this.roles.set(res.data); this.meta.set(res.meta); },
        error: e => this.error.set(e?.error?.error?.message || 'Failed to load roles')
      });
  }

  changePage(p: number): void {
    const m = this.meta();
    if (!m) return;
    if (p < 1 || p > m.totalPages) return;
    this.load(p);
  }

  trackById = (_: number, r: Role) => r._id;

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  goCreate(): void {
    this.router.navigate(['/roles/new']);
  }

  goDetail(id: string): void {
    this.router.navigate(['/roles', id]);
  }

  goEdit(id: string): void {
    this.router.navigate(['/roles', id, 'edit']);
  }

  remove(id: string): void {
    if (!confirm('Delete this role?')) return;

    const m = this.meta();
    const isLastItemOnPage = !!m && m.page > 1 && this.roles().length === 1;
    const nextPage = isLastItemOnPage ? (m!.page - 1) : (m?.page || 1);

    this.actionLoading.set(true);
    this.error.set(null);
    this.api.remove(id)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          this.showSuccess('Role deleted successfully');
          this.load(nextPage);
        },
        error: e => this.error.set(e?.error?.error?.message || 'Failed to delete role')
      });
  }

  permissionLabels(r: Role): string[] {
    return Array.isArray(r.permissions) ? r.permissions.map(p => p.name) : [];
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
  }
}