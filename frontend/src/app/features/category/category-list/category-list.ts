import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategoryService, CategoryListMeta } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.scss']
})
export class CategoryList implements OnInit, OnDestroy {
  readonly limit = 10;

  loading = signal(true);
  actionLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  private successTimer: any;
  private errorTimer: any;

  items = signal<Category[]>([]);
  meta = signal<CategoryListMeta | null>(null);

  hasPrev = computed(() => !!this.meta() && this.meta()!.hasPrevPage);
  hasNext = computed(() => !!this.meta() && this.meta()!.hasNextPage);

  constructor(private api: CategoryService, private router: Router) { }

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

  private showError(message: string): void {
    this.error.set(message);
    clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      if (this.error() === message) this.error.set(null);
    }, 3000);
  }

  load(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.list(page, this.limit)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => { this.items.set(res.data); this.meta.set(res.meta); },
        error: e => this.showError(e?.error?.error?.message || 'Failed to load categories')
      });
  }

  changePage(p: number): void {
    const m = this.meta();
    if (!m) return;
    if (p < 1 || p > m.totalPages) return;
    this.load(p);
  }

  trackById = (_: number, c: Category) => c._id;

  goBack(): void { this.router.navigate(['/dashboard']); }
  goCreate(): void { this.router.navigate(['/categories/new']); }
  goTree(): void { this.router.navigate(['/categories/tree']); }
  goDetail(id: string): void { this.router.navigate(['/categories', id]); }
  goEdit(id: string): void { this.router.navigate(['/categories', id, 'edit']); }

  remove(id: string): void {
    if (!confirm('Delete this category?')) return;

    const m = this.meta();
    const isLastItemOnPage = !!m && m.page > 1 && this.items().length === 1;
    const nextPage = isLastItemOnPage ? (m!.page - 1) : (m?.page || 1);

    this.actionLoading.set(true);
    this.error.set(null);
    this.api.remove(id)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          this.showSuccess('Category deleted successfully');
          this.load(nextPage);
        },
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

  parentName(cat: any): string {
    const p = (cat as any)?.parent;
    return p && typeof p === 'object' ? (p.name || '—') : '—';
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
    if (this.errorTimer) clearTimeout(this.errorTimer);
  }
}
