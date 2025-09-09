import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoleService, CreateRoleRequest, UpdateRoleRequest } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';
import { Permission } from '../../../core/models/permission.model';
import { Role } from '../../../core/models/role.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './role-form.html',
  styleUrls: ['./role-form.scss']
})
export class RoleForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private rolesApi = inject(RoleService);
  private permissionsApi = inject(PermissionService);

  form!: FormGroup;
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  id = signal<string | null>(null);
  fromDetail = signal(false);

  permissions = signal<Permission[]>([]);
  resourceOrder = ['user', 'role', 'permission', 'audit', 'category'] as const;
  resourceLabels: Record<string, string> = {
    user: 'User',
    role: 'Role',
    permission: 'Permission',
    audit: 'Audit',
    category: 'Category'
  };

  groupedPermissions = computed(() => {
    const groups: Record<string, Permission[]> = {};
    for (const key of this.resourceOrder) groups[key] = [];
    for (const p of this.permissions()) {
      if (!groups[p.resource]) groups[p.resource] = [];
      groups[p.resource].push(p);
    }
    return groups;
  });

  isEdit = computed(() => !!this.id());
  title = computed(() => this.isEdit() ? 'Edit Role' : 'Create Role');
  submitLabel = computed(() => this.isEdit() ? 'Save Changes' : 'Create Role');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.id.set(id);

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    this.fromDetail.set(!!state?.fromDetail);

    this.buildForm();
    this.loadPermissions();

    if (this.isEdit()) {
      this.loadRole();
    } else {
      this.loading.set(false);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9_\-\s]+$/)
      ]],
      displayName: ['', [Validators.maxLength(100)]],
      permissions: [[] as string[]]
    });
  }

  private loadPermissions(): void {
    this.permissionsApi.list(1, 100).subscribe({
      next: res => this.permissions.set(res.data),
      error: () => this.permissions.set([])
    });
  }

  private loadRole(): void {
    this.rolesApi.getById(this.id()!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          const r = res.data;
          if (r.isSystem) {
            this.router.navigate(['/roles', r._id], { state: { success: 'System roles cannot be edited' } });
            return;
          }
          this.form.patchValue({
            name: r.name,
            displayName: r.displayName || '',
            permissions: Array.isArray(r.permissions) ? r.permissions.map(p => p._id) : []
          });
        },
        error: e => this.error.set(e?.error?.error?.message || 'Failed to load role')
      });
  }

  trackByPermissionId = (_: number, p: Permission) => p._id;

  isPermSelected(id: string): boolean {
    const val = this.form.get('permissions')?.value as string[];
    return Array.isArray(val) && val.includes(id);
  }

  togglePerm(id: string, checked: boolean): void {
    const ctrl = this.form.get('permissions');
    if (!ctrl) return;

    const current = new Set<string>((ctrl.value as string[]) || []);
    if (checked) current.add(id); else current.delete(id);
    ctrl.setValue(Array.from(current));
    ctrl.markAsDirty();
  }

  goBack(): void {
    if (this.isEdit()) {
      if (this.fromDetail()) this.router.navigate(['/roles', this.id()!]);
      else this.router.navigate(['/roles']);
    } else {
      this.router.navigate(['/roles']);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.saving.set(true);

    const raw = this.form.getRawValue() as { name: string; displayName?: string; permissions: string[]; };

    if (!this.isEdit()) {
      const payload: CreateRoleRequest = {
        name: raw.name,
        displayName: raw.displayName?.trim() ? raw.displayName : undefined,
        permissions: raw.permissions
      };
      this.rolesApi.create(payload)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => this.router.navigate(['/roles'], { state: { success: 'Role created successfully' } }),
          error: e => this.error.set(e?.error?.error?.message || 'Create failed')
        });
      return;
    }

    const updatePayload: UpdateRoleRequest = {
      name: raw.name,
      displayName: raw.displayName?.trim() ? raw.displayName : undefined,
      permissions: raw.permissions
    };
    this.rolesApi.update(this.id()!, updatePayload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.fromDetail()) {
            this.router.navigate(['/roles', this.id()!], { state: { success: 'Role updated successfully' } });
          } else {
            this.router.navigate(['/roles'], { state: { success: 'Role updated successfully' } });
          }
        },
        error: e => this.error.set(e?.error?.error?.message || 'Update failed')
      });
  }
}