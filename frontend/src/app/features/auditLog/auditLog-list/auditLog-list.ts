import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuditLogService, AuditLogListFilters } from '../../../core/services/auditLog.service';
import { AuditLog } from '../../../core/models/auditLog.model';

@Component({
  selector: 'app-audit-log-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DatePipe],
  templateUrl: './auditLog-list.html',
  styleUrls: ['./auditLog-list.scss']
})
export class AuditLogList implements OnInit, OnDestroy {
  private api = inject(AuditLogService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly limit = 20;

  loading = signal(true);
  actionLoading = signal(false);
  error = signal<string | null>(null);
  logs = signal<AuditLog[]>([]);
  meta = signal<{ page: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean } | null>(null);

  filterOpen = signal(false);

  form = this.fb.group({
    user: [''],
    action: [''],
    resource: [''],
    status: [''],
    from: [''],
    to: ['']
  });

  hasPrev = computed(() => !!this.meta() && this.meta()!.hasPrevPage);
  hasNext = computed(() => !!this.meta() && this.meta()!.hasNextPage);

  ngOnInit(): void {
    this.load(1);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  private collectFilters(): AuditLogListFilters {
    const raw = this.form.getRawValue();
    return {
      user: raw.user?.trim() || undefined,
      action: raw.action?.trim() || undefined,
      resource: raw.resource?.trim() || undefined,
      status: raw.status as any || undefined,
      from: raw.from || undefined,
      to: raw.to || undefined
    };
  }

  toggleFilters(): void {
    this.filterOpen.update(v => !v);
  }

  applyFilters(): void {
    this.load(1);
  }

  resetFilters(): void {
    this.form.reset({
      user: '',
      action: '',
      resource: '',
      status: '',
      from: '',
      to: ''
    });
    this.form.markAsPristine();
    this.load(1);
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    const filters = this.collectFilters();
    this.api.list(page, this.limit, filters)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          this.logs.set(res.data);
          this.meta.set(res.meta);
        },
        error: e => this.showError(e?.error?.error?.message || 'Failed to load audit logs')
      });
  }

  changePage(p: number): void {
    const m = this.meta();
    if (!m) return;
    if (p < 1 || p > m.totalPages) return;
    this.load(p);
  }

  view(id: string): void {
    this.router.navigate(['/audit-logs', id]);
  }

  trackById = (_: number, l: AuditLog) => l._id;

  statusChip(l: AuditLog): string {
    return l.status === 'success' ? 'chip chip--success' : 'chip chip--danger';
  }

  userLabel(l: AuditLog): string {
    if (l.user && typeof l.user === 'object') {
      return (l.user.firstName && l.user.lastName) ? `${l.user.firstName} ${l.user.lastName}` : (l.user.email || 'Unknown');
    }
    return l.user || '—';
  }

  private showError(message: string) {
    this.error.set(message);
  }

  ngOnDestroy(): void {
  }
}