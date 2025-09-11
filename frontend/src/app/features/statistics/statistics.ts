import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService, StatsResult } from '../../core/services/statistics.service';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.scss']
})
export class Stats implements OnInit {
  private api = inject(StatisticsService);
  private router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  data = signal<StatsResult | null>(null);

  donutPerc = computed(() => {
    const d = this.data();
    if (!d || d.totalUsers === 0) return { active: 0, inactive: 0 };
    const activePct = (d.activeUsers / d.totalUsers) * 100;
    return { active: activePct, inactive: 100 - activePct };
  });

  maxRoleCount = computed(() => {
    const d = this.data();
    if (!d || !d.roleDistribution?.length) return 0;
    return d.roleDistribution.reduce((m, x) => Math.max(m, x.count), 0);
  });

  ngOnInit(): void {
    this.load();
  }

  private formatError(err: unknown): string {
    const fallback = 'Failed to load statistics';
    if (!err) return fallback;
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return fallback;
      const backendMsg =
        (err.error && (err.error.message || err.error.error?.message)) || '';
      return backendMsg || err.message || fallback;
    }
    const anyErr = err as any;
    return anyErr?.error?.error?.message || anyErr?.message || fallback;
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.loadStats()
      .pipe(take(1), finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res: StatsResult) => this.data.set(res),
        error: (err: unknown) => this.error.set(this.formatError(err))
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  trackRole = (_: number, r: { role: string; count: number }) => r.role;

  barWidth(r: { count: number }): number {
    const max = this.maxRoleCount();
    return max ? (r.count / max) * 100 : 0;
  }
}