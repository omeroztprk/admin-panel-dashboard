import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuditLogService } from '../../../core/services/auditLog.service';
import { AuditLog } from '../../../core/models/auditLog.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-audit-log-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './auditlog-detail.html',
  styleUrls: ['./auditlog-detail.scss']
})
export class AuditLogDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(AuditLogService);

  loading = signal(true);
  error = signal<string | null>(null);
  log = signal<AuditLog | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  private load(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.api.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => this.log.set(res.data),
        error: e => this.showError(e?.error?.error?.message || 'Failed to load audit log')
      });
  }

  statusChip(l: AuditLog): string {
    return l.status === 'success' ? 'chip chip--success' : 'chip chip--danger';
  }

  userLabel(): string {
    const l = this.log();
    if (!l) return '';
    if (l.user && typeof l.user === 'object') {
      return (l.user.firstName && l.user.lastName) ? `${l.user.firstName} ${l.user.lastName}` : (l.user.email || 'Unknown');
    }
    return l.user || '—';
  }

  goBack(): void {
    this.router.navigate(['/audit-logs']);
  }

  private showError(message: string) {
    this.error.set(message);
  }

  ngOnDestroy(): void {
  }
}