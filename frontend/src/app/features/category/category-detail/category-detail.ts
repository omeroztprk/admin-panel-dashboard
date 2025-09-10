import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './category-detail.html',
  styleUrls: ['./category-detail.scss']
})
export class CategoryDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CategoryService);

  loading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  private successTimer: any;
  private errorTimer: any;

  item = signal<Category | null>(null);

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

  private showError(message: string): void {
    this.error.set(message);
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => { if (this.error() === message) this.error.set(null); }, 3000);
  }

  private load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => this.item.set(res.data),
        error: e => this.showError(e?.error?.error?.message || 'Failed to load category')
      });
  }

  goBack(): void { this.router.navigate(['/categories']); }

  goEdit(): void {
    const id = this.item()?._id;
    if (id) this.router.navigate(['/categories', id, 'edit'], { state: { fromDetail: true } });
  }

  remove(): void {
    const id = this.item()?._id;
    if (!id) return;
    if (!confirm('Delete this category?')) return;

    this.api.remove(id).subscribe({
      next: () => this.router.navigate(['/categories'], { state: { success: 'Category deleted successfully' } }),
      error: e => {
        const status = e?.status || e?.error?.statusCode;
        this.showError(
          status === 409
            ? 'Category has child categories and cannot be deleted'
            : (e?.error?.error?.message || 'Failed to delete category')
        );
      }
    });
  }

  parentName(cat: Category): string {
    const p = cat?.parent as Category | string | null | undefined;
    return p && typeof p === 'object' ? (p.name || '—') : '—';
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
    if (this.errorTimer) clearTimeout(this.errorTimer);
  }
}
