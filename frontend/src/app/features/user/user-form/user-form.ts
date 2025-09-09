import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { Role } from '../../../core/models/role.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss']
})
export class UserForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private users = inject(UserService);
  private rolesApi = inject(RoleService);

  form!: FormGroup;
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);
  roles = signal<Role[]>([]);
  showPassword = signal(false);

  id = signal<string | null>(null);
  fromDetail = signal(false);

  isEdit = computed(() => !!this.id());
  title = computed(() => this.isEdit() ? 'Edit User' : 'Create User');
  submitLabel = computed(() => this.isEdit() ? 'Save Changes' : 'Create User');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.id.set(id);

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    this.fromDetail.set(!!state?.fromDetail);

    this.buildForm();
    this.loadRoles();

    if (this.isEdit()) {
      this.loadUser();
    } else {
      this.loading.set(false);
    }
  }

  private buildForm(): void {
    const passwordValidators = this.isEdit()
      ? [
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]).+$/)
      ]
      : [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]).+$/)
      ];

    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      email: ['', [Validators.required, Validators.email]],
      roles: [[] as string[]],
      isActive: [true],
      newPassword: ['', passwordValidators]
    });
  }

  private loadRoles(): void {
    this.rolesApi.list(1, 100).subscribe({
      next: res => this.roles.set(res.data),
      error: () => this.roles.set([])
    });
  }

  private loadUser(): void {
    this.users.getById(this.id()!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          const u = res.data;
          this.form.patchValue({
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            roles: Array.isArray(u.roles) ? u.roles.map(r => r._id) : [],
            isActive: !!u.isActive
          });
          this.form.get('email')?.disable({ emitEvent: false });
        },
        error: e => this.error.set(e?.error?.error?.message || 'Failed to load user')
      });
  }

  shouldShowPasswordError(): boolean {
    const passwordControl = this.form.get('newPassword');
    if (!passwordControl?.touched) return false;

    if (!this.isEdit()) {
      return passwordControl.invalid;
    }

    const hasValue = passwordControl.value?.trim().length > 0;
    return hasValue && passwordControl.invalid;
  }

  trackByRoleId = (_: number, r: Role) => r._id;
  roleName(r: Role): string { return r.displayName || r.name; }

  isRoleSelected(id: string): boolean {
    const val = this.form.get('roles')?.value as string[];
    return Array.isArray(val) && val.includes(id);
  }

  toggleRole(id: string, checked: boolean): void {
    const ctrl = this.form.get('roles');
    if (!ctrl) return;

    const current = new Set<string>((ctrl.value as string[]) || []);
    if (checked) {
      current.add(id);
    } else {
      current.delete(id);
    }

    ctrl.setValue(Array.from(current));
    ctrl.markAsDirty();
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  goBack(): void {
    if (this.isEdit()) {
      if (this.fromDetail()) {
        this.router.navigate(['/users', this.id()!]);
      } else {
        this.router.navigate(['/users']);
      }
    } else {
      this.router.navigate(['/users']);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.saving.set(true);

    const raw = this.form.getRawValue() as {
      firstName: string;
      lastName: string;
      email: string;
      roles: string[];
      isActive: boolean;
      newPassword?: string;
    };

    if (!this.isEdit()) {
      this.createUser(raw);
    } else {
      this.updateUser(raw);
    }
  }

  private createUser(data: any): void {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.newPassword!,
      roles: data.roles,
      isActive: data.isActive
    };

    this.users.create(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/users'], { state: { success: 'User created successfully' } });
        },
        error: e => this.error.set(e?.error?.error?.message || 'Create failed')
      });
  }

  private updateUser(data: any): void {
    const payload: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      roles: data.roles,
      isActive: data.isActive
    };

    if (data.newPassword?.trim()) payload.password = data.newPassword;

    this.users.update(this.id()!, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.fromDetail()) {
            this.router.navigate(['/users', this.id()!], { state: { success: 'User updated successfully' } });
          } else {
            this.router.navigate(['/users'], { state: { success: 'User updated successfully' } });
          }
        },
        error: e => this.error.set(e?.error?.error?.message || 'Update failed')
      });
  }
}