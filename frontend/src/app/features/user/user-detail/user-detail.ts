import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './user-detail.html',
  styleUrls: ['./user-detail.scss']
})
export class UserDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(UserService);

  loading = signal(true);
  error = signal<string | null>(null);
  user = signal<User | null>(null);
  success = signal<string | null>(null);
  private successTimer: any;
  private errorTimer: any;

  fullName = computed(() => {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  roleLabels = computed(() => {
    const u = this.user();
    return Array.isArray(u?.roles) ? u!.roles.map(r => r.displayName || r.name) : [];
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

  private load(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.api.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => this.user.set(res.data),
        error: e => this.showError(e?.error?.error?.message || 'Failed to load user')
      });
  }
  private showError(message: string): void {
    this.error.set(message);
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      if (this.error() === message) this.error.set(null);
    }, 3000);
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  goEdit(): void {
    const id = this.user()?._id;
    if (id) {
      this.router.navigate(['/users', id, 'edit'], {
        state: { fromDetail: true }
      });
    }
  }

  remove(): void {
    const id = this.user()?._id;
    if (!id) return;
    if (!confirm('Delete this user?')) return;

    this.api.remove(id).subscribe({
      next: () => this.router.navigate(['/users'], {
        state: { success: 'User deleted successfully' }
      }),
      error: e => this.showError(e?.error?.error?.message || 'Failed to delete user')
    });
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
    if (this.errorTimer) clearTimeout(this.errorTimer);
  }

  chipClass(u: User): string {
    return u.isActive ? 'chip chip--success' : 'chip chip--danger';
  }
}
