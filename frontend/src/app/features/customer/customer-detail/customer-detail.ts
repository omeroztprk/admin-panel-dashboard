import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/models/customer.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './customer-detail.html',
  styleUrls: ['./customer-detail.scss']
})
export class CustomerDetail implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CustomerService);

  loading = signal(true);
  error = signal<string | null>(null);
  customer = signal<Customer | null>(null);
  success = signal<string | null>(null);
  private successTimer: any;

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
        next: res => this.customer.set(res.data),
        error: e => this.showError(e?.error?.error?.message || 'Failed to load customer')
      });
  }

  private showError(message: string): void {
    this.error.set(message);
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }

  goEdit(): void {
    const id = this.customer()?._id;
    if (id) {
      this.router.navigate(['/customers', id, 'edit'], {
        state: { fromDetail: true }
      });
    }
  }

  remove(): void {
    const id = this.customer()?._id;
    if (!id) return;
    if (!confirm('Delete this customer?')) return;

    this.api.remove(id).subscribe({
      next: () => this.router.navigate(['/customers'], {
        state: { success: 'Customer deleted successfully' }
      }),
      error: e => this.showError(e?.error?.error?.message || 'Failed to delete customer')
    });
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
  }
}
