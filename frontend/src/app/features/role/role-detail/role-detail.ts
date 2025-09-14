import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { Role } from '../../../core/models/role.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './role-detail.html',
  styleUrls: ['./role-detail.scss']
})
export class RoleDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(RoleService);
  private auth = inject(AuthService);
  private profile = inject(ProfileService);

  loading = signal(true);
  error = signal<string | null>(null);
  role = signal<Role | null>(null);
  success = signal<string | null>(null);
  private successTimer: any;

  resourceOrder = ['user', 'role', 'permission', 'audit', 'category', 'stat', 'customer'] as const;
  resourceLabels: Record<string, string> = {
    user: 'User',
    role: 'Role',
    permission: 'Permission',
    audit: 'Audit',
    category: 'Category',
    stat: 'Statistic',
    customer: 'Customer'
  };

  groupedPermissions = computed(() => {
    const groups: Record<string, string[]> = {};
    for (const key of this.resourceOrder) groups[key] = [];
    const r = this.role();
    if (Array.isArray(r?.permissions)) {
      for (const p of r!.permissions) {
        if (!groups[p.resource]) groups[p.resource] = [];
        groups[p.resource].push(p.name);
      }
    }
    return groups;
  });

  permissionLabels = computed(() => {
    const r = this.role();
    return Array.isArray(r?.permissions) ? r!.permissions.map(p => p.name) : [];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
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

  private showError(message: string): void {
    this.error.set(message);
  }

  private load(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.api.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => this.role.set(res.data),
        error: e => this.showError(e?.error?.error?.message || 'Failed to load role')
      });
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }

  goEdit(): void {
    const id = this.role()?._id;
    if (id) {
      this.router.navigate(['/roles', id, 'edit'], { state: { fromDetail: true } });
    }
  }

  remove(): void {
    const id = this.role()?._id;
    if (!id) return;
    if (!confirm('Delete this role?')) return;
    this.api.remove(id).subscribe({
      next: () => {
        const me = this.auth.getCurrentUser();
        const affected = !!me?.roles?.some(r => r._id === id);
        if (affected) this.profile.getProfile().subscribe();
        this.router.navigate(['/roles'], { state: { success: 'Role deleted successfully' } });
      },
      error: e => this.showError(e?.error?.error?.message || 'Failed to delete role')
    });
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
  }
}