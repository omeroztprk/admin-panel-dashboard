import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  loginForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.loginForm.getRawValue() as LoginRequest;

    this.auth.login({ email, password }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        const r = res.data;
        if (r.tfaRequired && r.tfaId) {
          this.router.navigate(['/auth/tfa-verify'], { queryParams: { tfaId: r.tfaId } });
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (e) => this.error.set(e.error?.error?.message || 'Login failed')
    });
  }
}
