import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PermissionService } from '../../../core/services/permission.service';
import { Permission } from '../../../core/models/permission.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-permission-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './permission-detail.html',
  styleUrls: ['./permission-detail.scss']
})
export class PermissionDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PermissionService);

  loading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  private successTimer: any;

  item = signal<Permission | null>(null);

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
    this.successTimer = setTimeout(() => { if (this.success() === message) this.success.set(null); }, 3000);
  }

  private load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => this.item.set(res.data),
        error: e => this.error.set(e?.error?.error?.message || 'Failed to load permission')
      });
  }

  goBack(): void { this.router.navigate(['/permissions']); }

  goEdit(): void {
    const id = this.item()?._id;
    if (id) this.router.navigate(['/permissions', id, 'edit'], { state: { fromDetail: true } });
  }

  remove(): void {
    const id = this.item()?._id;
    if (!id) return;
    if (!confirm('Delete this permission?')) return;

    this.api.remove(id).subscribe({
      next: () => this.router.navigate(['/permissions'], { state: { success: 'Permission deleted successfully' } }),
      error: e => this.error.set(e?.error?.error?.message || 'Failed to delete permission')
    });
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
  }
}