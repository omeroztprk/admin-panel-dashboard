import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PermissionService } from '../../../core/services/permission.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { CreatePermissionRequest, UpdatePermissionRequest } from '../../../core/models/permission.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-permission-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './permission-form.html',
  styleUrls: ['./permission-form.scss']
})
export class PermissionForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(PermissionService);
  private auth = inject(AuthService);
  private profile = inject(ProfileService);

  form!: FormGroup;
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  id = signal<string | null>(null);
  fromDetail = signal(false);

  readonly resources = ['user', 'role', 'permission', 'audit', 'category', 'stat', 'customer'] as const;
  readonly actions = ['create', 'read', 'update', 'delete'] as const;

  isEdit = computed(() => !!this.id());
  title = computed(() => this.isEdit() ? 'Edit Permission' : 'Create Permission');
  submitLabel = computed(() => this.isEdit() ? 'Save Changes' : 'Create Permission');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.id.set(id);

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    this.fromDetail.set(!!state?.fromDetail);

    this.buildForm();

    if (this.isEdit()) {
      this.loadItem();
    } else {
      this.loading.set(false);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      resource: ['', [Validators.required]],
      action: ['', [Validators.required]],
      description: ['', [Validators.maxLength(255)]]
    });
  }

  private loadItem(): void {
    this.api.getById(this.id()!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          const p = res.data;
          if (p.isSystem) {
            this.router.navigate(['/permissions', p._id], { state: { success: 'System permissions cannot be edited' } });
            return;
          }
          this.form.patchValue({
            resource: p.resource,
            action: p.action,
            description: p.description || ''
          });
        },
        error: e => this.error.set(e?.error?.error?.message || 'Failed to load permission')
      });
  }

  goBack(): void {
    if (this.isEdit()) {
      if (this.fromDetail()) this.router.navigate(['/permissions', this.id()!]);
      else this.router.navigate(['/permissions']);
    } else {
      this.router.navigate(['/permissions']);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.saving.set(true);

    const raw = this.form.getRawValue() as { resource: string; action: string; description?: string; };

    if (!this.isEdit()) {
      const payload: CreatePermissionRequest = {
        resource: raw.resource,
        action: raw.action,
        description: raw.description?.trim() || undefined
      };
      this.api.create(payload)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => this.router.navigate(['/permissions'], { state: { success: 'Permission created successfully' } }),
          error: e => this.error.set(e?.error?.error?.message || 'Create failed')
        });
      return;
    }

    const updatePayload: UpdatePermissionRequest = {
      resource: raw.resource,
      action: raw.action,
      description: raw.description?.trim() || undefined
    };
    this.api.update(this.id()!, updatePayload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          const me = this.auth.getCurrentUser();
          const pid = this.id()!;
          const affected = !!me?.roles?.some(r => Array.isArray(r.permissions) && r.permissions.some(p => p._id === pid));
          if (affected) this.profile.getProfile().subscribe();
          if (this.fromDetail()) {
            this.router.navigate(['/permissions', this.id()!], { state: { success: 'Permission updated successfully' } });
          } else {
            this.router.navigate(['/permissions'], { state: { success: 'Permission updated successfully' } });
          }
        },
        error: e => this.error.set(e?.error?.error?.message || 'Update failed')
      });
  }
}