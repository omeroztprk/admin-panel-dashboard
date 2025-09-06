import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.model';
import { UserSyncService } from '../../../core/services/user-sync.service';

@Component({
  selector: 'app-profile-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-detail.html',
  styleUrls: ['./profile-detail.scss']
})
export class ProfileDetail implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  rolesList = computed(() => this.auth.currentUserSig()?.roles || []);
  roleLabel(r: Role) { return r?.displayName || r?.name || ''; }

  constructor(
    public auth: AuthService,
    private router: Router,
    private userSync: UserSyncService
  ) { }

  ngOnInit(): void {
    const check = () => {
      if (this.auth.currentUserSig()) this.loading.set(false);
    };
    check();
    queueMicrotask(check);
    setTimeout(check, 150);
    setTimeout(() => { if (this.loading()) this.loading.set(false); }, 2000);

    const { success } = history.state || {};
    if (success) {
      this.success.set(success);
      setTimeout(() => this.success.set(null), 2500);
    }
  }

  isRenderableAvatar(src: string): boolean {
    if (!src) return false;
    return /^(https?:\/\/|\/|data:image\/|assets\/|blob:)/.test(src);
  }

  goEdit(): void {
    this.router.navigate(['/profile/edit'], { replaceUrl: true });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}