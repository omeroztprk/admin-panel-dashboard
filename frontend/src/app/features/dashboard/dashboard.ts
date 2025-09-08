import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard {
  private auth = inject(AuthService);
  user = computed(() => this.auth.currentUserSig());

  roleLabels(): string[] {
    const u = this.user();
    return Array.isArray(u?.roles)
      ? u.roles.map((r: any) => r?.displayName ?? r?.name ?? String(r))
      : [];
  }
}
