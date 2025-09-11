import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/role.model';
import { SystemHealth } from '../../core/models/health.model';
import { SystemHealthService } from '../../core/services/system-health.service';
import { AuditLogService } from '../../core/services/auditLog.service';
import { AuditLog } from '../../core/models/auditLog.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {
  private auth = inject(AuthService);
  private healthApi = inject(SystemHealthService);
  private auditApi = inject(AuditLogService);

  user = computed(() => this.auth.currentUserSig());

  healthLoading = signal(true);
  healthError = signal<string | null>(null);
  health = signal<SystemHealth | null>(null);

  recentLoading = signal(true);
  recentError = signal<string | null>(null);
  recentLogs = signal<AuditLog[]>([]);

  constructor() {
    this.loadHealth();
    this.loadRecentAuditLogs();
  }

  roleLabels(): string[] {
    const u = this.user();
    return Array.isArray(u?.roles) ? u.roles.map((r: Role) => r.displayName || r.name) : [];
  }

  loadHealth(): void {
    this.healthLoading.set(true);
    this.healthError.set(null);
    this.healthApi.get().subscribe({
      next: h => {
        this.health.set(h);
        this.healthLoading.set(false);
      },
      error: err => {
        this.healthError.set(err?.error?.error?.message || 'Failed to load health');
        this.healthLoading.set(false);
      }
    });
  }

  loadRecentAuditLogs(): void {
    this.recentLoading.set(true);
    this.recentError.set(null);
    this.auditApi.list(1, 5)
      .subscribe({
        next: res => {
          this.recentLogs.set(res.data);
          this.recentLoading.set(false);
        },
        error: e => {
          this.recentError.set(e?.error?.error?.message || 'Failed to load recent audit logs');
          this.recentLoading.set(false);
        }
      });
  }

  uptimeFmt(): string {
    const h = this.health();
    if (!h) return '—';
    const sec = Math.floor(h.uptime);
    const d = Math.floor(sec / 86400);
    const rem = sec % 86400;
    const hh = Math.floor(rem / 3600);
    const mm = Math.floor((rem % 3600) / 60);
    if (d) return `${d}d ${hh}h ${mm}m`;
    if (hh) return `${hh}h ${mm}m`;
    return `${mm}m`;
  }

  auditUserLabel(l: AuditLog): string {
    if (l.user && typeof l.user === 'object') {
      return (l.user.firstName && l.user.lastName)
        ? `${l.user.firstName} ${l.user.lastName}`
        : (l.user.email || 'Unknown');
    }
    return (l.user as any) || '—';
  }

  statusChip(l: AuditLog): string {
    return l.status === 'success' ? 'chip chip--success' : 'chip chip--danger';
  }

  trackById = (_: number, l: AuditLog) => l._id;
}
