import { Component, ChangeDetectionStrategy, signal, computed, input, output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  mobileSidebarOpen = input<boolean>(false);
  toggleSidebar = output<void>();

  user = computed<User | null>(() => this.auth.currentUserSig());
  showMenu = signal(false);

  @ViewChild('menuRoot') menuRoot?: ElementRef<HTMLElement>;

  constructor(
    public auth: AuthService,
    private router: Router
  ) { }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  toggleMenu() {
    this.showMenu.update(v => !v);
  }

  closeMenu() {
    this.showMenu.set(false);
  }

  gotoProfile() { this.router.navigate(['/profile']); this.closeMenu(); }
  gotoSessions() { this.router.navigate(['/sessions']); this.closeMenu(); }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => { this.auth.clear(); this.router.navigate(['/auth/login']); }
    });
    this.closeMenu();
  }

  @HostListener('document:keydown.escape')
  onEsc() { if (this.showMenu()) this.closeMenu(); }

  @HostListener('document:click', ['$event'])
  onDoc(ev: MouseEvent) {
    if (!this.showMenu()) return;
    const root = this.menuRoot?.nativeElement;
    if (root && !root.contains(ev.target as Node)) this.closeMenu();
  }
}
