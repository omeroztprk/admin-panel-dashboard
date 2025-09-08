import { Component, computed, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-detail.html',
  styleUrls: ['./profile-detail.scss']
})
export class ProfileDetail implements OnInit, OnDestroy {
  private clearTimer: any;
  private auth = inject(AuthService);
  private profile = inject(ProfileService);
  private router = inject(Router);

  loading = signal(true);
  success = signal<string | null>(null);

  user = computed(() => this.auth.currentUserSig());
  roles = computed(() => this.user()?.roles || []);
  roleLabel = (r: any) => r?.displayName || r?.name || '';

  ngOnInit(): void {
    const msg = history.state?.success;
    if (msg) this.showSuccess(msg);

    this.profile.getProfile().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false)
    });
  }

  private showSuccess(message: string) {
    this.success.set(message);
    this.clearTimer && clearTimeout(this.clearTimer);
    this.clearTimer = setTimeout(() => {
      if (this.success() === message) this.success.set(null);
    }, 2500);
  }
  ngOnDestroy(): void {
    if (this.clearTimer) clearTimeout(this.clearTimer);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  goEdit(): void {
    this.router.navigate(['/profile/edit']);
  }
}