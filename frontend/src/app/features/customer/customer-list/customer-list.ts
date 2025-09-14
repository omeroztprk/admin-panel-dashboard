import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { ListMeta } from '../../../core/models/api.types';
import { Customer } from '../../../core/models/customer.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-list.html',
  styleUrls: ['./customer-list.scss']
})
export class CustomerList implements OnInit, OnDestroy {
  private api = inject(CustomerService);
  private router = inject(Router);

  readonly limit = 10;

  loading = signal(true);
  actionLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  private successTimer: any;

  customers = signal<Customer[]>([]);
  meta = signal<ListMeta | null>(null);

  hasPrev = computed(() => !!this.meta() && this.meta()!.hasPrevPage);
  hasNext = computed(() => !!this.meta() && this.meta()!.hasNextPage);

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
        next: res => { this.customers.set(res.data); this.meta.set(res.meta); },
        error: e => this.showError(e?.error?.error?.message || 'Failed to load customers')
      });
  }

  private showError(message: string): void {
    this.error.set(message);
  }

  changePage(p: number): void {
    const m = this.meta();
    if (!m) return;
    if (p < 1 || p > m.totalPages) return;
    this.load(p);
  }

  trackById = (_: number, c: Customer) => c._id;

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  goCreate(): void {
    this.router.navigate(['/customers/new']);
  }

  goDetail(id: string): void {
    this.router.navigate(['/customers', id]);
  }

  goEdit(id: string): void {
    this.router.navigate(['/customers', id, 'edit']);
  }

  remove(id: string): void {
    if (!confirm('Delete this customer?')) return;
    const m = this.meta();
    const isLastItemOnPage = !!m && m.page > 1 && this.customers().length === 1;
    const nextPage = isLastItemOnPage ? (m!.page - 1) : (m?.page || 1);

    this.actionLoading.set(true);
    this.error.set(null);
    this.api.remove(id)
      .pipe(finalize(() => this.actionLoading.set(false)))
      .subscribe({
        next: () => {
          this.showSuccess('Customer deleted successfully');
          this.load(nextPage);
        },
        error: e => this.showError(e?.error?.error?.message || 'Failed to delete customer')
      });
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
  }
}
