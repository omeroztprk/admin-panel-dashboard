import { Component, OnInit, signal, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';
import { ProfileUpdateRequest } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile-update.html',
  styleUrls: ['./profile-update.scss']
})
export class ProfileUpdate implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private profile = inject(ProfileService);
  public auth = inject(AuthService);
  private router = inject(Router);

  form!: FormGroup;
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  showCurrent = signal(false);
  showNew = signal(false);

  private showError(message: string): void {
    this.error.set(message);
  }

  ngOnInit(): void {
    this.buildForm();
    this.profile.getProfile()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          this.form.patchValue({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            email: res.data.email
          });
        },
        error: e => this.showError(e.error?.error?.message || 'Profile load failed')
      });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      email: [{ value: '', disabled: true }],
      currentPassword: [''],
      newPassword: ['', [
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]).+$/)
      ]]
    }, { validators: this.passwordPairValidator });
  }

  private passwordPairValidator(group: AbstractControl): ValidationErrors | null {
    const current = (group.get('currentPassword')?.value || '').trim();
    const next = (group.get('newPassword')?.value || '').trim();
    if (!current && !next) return null;
    if (!current || !next) return { passwordPair: true };
    return null;
  }

  toggleCurrent(): void { this.showCurrent.set(!this.showCurrent()); }
  toggleNew(): void { this.showNew.set(!this.showNew()); }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.saving.set(true);

    const { firstName, lastName, currentPassword, newPassword } =
      this.form.getRawValue() as ProfileUpdateRequest;

    const payload: ProfileUpdateRequest = { firstName, lastName };
    if (currentPassword && newPassword) {
      payload.currentPassword = currentPassword;
      payload.newPassword = newPassword;
    }

    this.profile.updateProfile(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.form.get('currentPassword')?.reset('');
          this.form.get('newPassword')?.reset('');
          this.router.navigate(['/profile'], {
            replaceUrl: true,
            state: { success: 'Profile updated' }
          });
        },
        error: e => this.showError(e.error?.error?.message || 'Update failed')
      });
  }

  goBack(): void {
    this.router.navigate(['/profile'], { replaceUrl: true });
  }

  passwordFormError(code: string): boolean {
    return !!this.form.errors?.[code];
  }

  ngOnDestroy(): void {}
}
