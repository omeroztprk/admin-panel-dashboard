import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../core/services/customer.service';
import { CreateCustomerRequest, UpdateCustomerRequest } from '../../../core/models/customer.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './customer-form.html',
  styleUrls: ['./customer-form.scss']
})
export class CustomerForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customers = inject(CustomerService);

  form!: FormGroup;
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  id = signal<string | null>(null);
  fromDetail = signal(false);
  slug = signal<string | null>(null);

  isEdit = computed(() => !!this.id());
  title = computed(() => this.isEdit() ? 'Edit Customer' : 'Create Customer');
  submitLabel = computed(() => this.isEdit() ? 'Save Changes' : 'Create Customer');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.id.set(id);

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    this.fromDetail.set(!!state?.fromDetail);

    this.buildForm();

    if (this.isEdit()) {
      this.loadCustomer();
    } else {
      this.loading.set(false);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      prompt: ['', [Validators.maxLength(2000)]]
    });
  }

  private loadCustomer(): void {
    this.customers.getById(this.id()!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          const c = res.data;
          this.form.patchValue({
            name: c.name,
            prompt: c.prompt || ''
          });
          this.slug.set(c.slug);
        },
        error: e => this.error.set(e?.error?.error?.message || 'Failed to load customer')
      });
  }

  goBack(): void {
    if (this.isEdit()) {
      if (this.fromDetail()) {
        this.router.navigate(['/customers', this.id()!]);
      } else {
        this.router.navigate(['/customers']);
      }
    } else {
      this.router.navigate(['/customers']);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.saving.set(true);

    const formData = this.form.getRawValue() as {
      name: string;
      prompt: string;
    };

    if (!this.isEdit()) {
      this.createCustomer(formData);
    } else {
      this.updateCustomer(formData);
    }
  }

  private createCustomer(data: { name: string; prompt: string; }): void {
    const payload: CreateCustomerRequest = {
      name: data.name,
      prompt: data.prompt || undefined
    };

    this.customers.create(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/customers'], { state: { success: 'Customer created successfully' } });
        },
        error: e => this.error.set(e?.error?.error?.message || 'Create failed')
      });
  }

  private updateCustomer(data: { name: string; prompt: string; }): void {
    const payload: UpdateCustomerRequest = {
      name: data.name,
      prompt: data.prompt || undefined
    };

    this.customers.update(this.id()!, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.fromDetail()) {
            this.router.navigate(['/customers', this.id()!], { state: { success: 'Customer updated successfully' } });
          } else {
            this.router.navigate(['/customers'], { state: { success: 'Customer updated successfully' } });
          }
        },
        error: e => this.error.set(e?.error?.error?.message || 'Update failed')
      });
  }
}
