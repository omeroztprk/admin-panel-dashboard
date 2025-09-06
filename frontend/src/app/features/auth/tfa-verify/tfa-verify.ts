import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TfaService } from '../../../core/services/tfa.service';
import { TfaVerifyRequest } from '../../../core/models/auth.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tfa-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './tfa-verify.html',
  styleUrls: ['./tfa-verify.scss']
})
export class TfaVerify implements OnInit {
  tfaForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  tfaId = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private tfa: TfaService,
    private router: Router
  ) {
    this.tfaForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('tfaId');
    if (!id) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.tfaId.set(id);
  }

  onSubmit(): void {
    if (this.tfaForm.invalid || !this.tfaId()) return;
    this.loading.set(true);
    this.error.set(null);

    const { code } = this.tfaForm.getRawValue();
    const payload: TfaVerifyRequest = { tfaId: this.tfaId()!, code };

    this.tfa.verify(payload).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => this.error.set(e.error?.error?.message || 'Verification failed')
    });
  }
}
