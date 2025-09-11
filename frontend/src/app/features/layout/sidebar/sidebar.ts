import { Component, ChangeDetectionStrategy, input, output, computed, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
  permissions?: string[];
  roles?: string[];
  disabled?: boolean;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  mobileSidebarOpen = input<boolean>(false);
  closeSidebar = output<void>();
  public auth = inject(AuthService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  private readonly allGroups: NavGroup[] = [
    {
      id: 'g-general',
      title: 'General',
      items: [
        { id: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'dashboard', exact: true },
        { id: 'statistics', label: 'Statistics', route: '/statistics', icon: 'stats', permissions: ['user:read'] }
      ]
    },
    {
      id: 'g-account',
      title: 'Account',
      items: [
        { id: 'profile', label: 'Profile', route: '/profile', icon: 'profile' },
        { id: 'sessions', label: 'Sessions', route: '/sessions', icon: 'sessions' }
      ]
    },
    {
      id: 'g-management',
      title: 'Management',
      items: [
        { id: 'users', label: 'Users', route: '/users', icon: 'users', permissions: ['user:read'] },
        { id: 'roles', label: 'Roles', route: '/roles', icon: 'roles', permissions: ['role:read'] },
        { id: 'permissions', label: 'Permissions', route: '/permissions', icon: 'permissions', permissions: ['permission:read'] }
      ]
    },
    {
      id: 'g-monitor',
      title: 'Monitoring',
      items: [{ id: 'audit', label: 'Audit Logs', route: '/audit-logs', icon: 'audit', permissions: ['audit:read'] }]
    },
    {
      id: 'g-catalog',
      title: 'Catalog',
      items: [{ id: 'categories', label: 'Categories', route: '/categories', icon: 'categories', permissions: ['category:read'] }]
    }
  ];

  user = computed<User | null>(() => this.auth.currentUserSig());
  private permissionSet = computed<Set<string>>(() => {
    const u = this.user();
    if (!u) return new Set();
    return new Set(
      u.roles.flatMap(r => (r.permissions || []).map(p => `${p.resource}:${p.action}`))
    );
  });
  private roleNameSet = computed<Set<string>>(() => {
    const u = this.user();
    if (!u) return new Set();
    return new Set(u.roles.map(r => r.name));
  });

  navGroups = computed<NavGroup[]>(() => {
    const u = this.user();
    if (!u) return [];
    return this.allGroups
      .map(g => ({
        ...g,
        items: g.items.filter(i => this.canAccess(i))
      }))
      .filter(g => g.items.length);
  });

  private canAccess(item: NavItem): boolean {
    if (item.disabled) return false;
    if (!item.permissions && !item.roles) return true;
    if (item.permissions) {
      for (const p of item.permissions) {
        if (!this.permissionSet().has(p)) return false;
      }
    }
    if (item.roles) {
      let ok = false;
      for (const r of item.roles) {
        if (this.roleNameSet().has(r)) {
          ok = true;
          break;
        }
      }
      if (!ok) return false;
    }
    return true;
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => { this.auth.clear(); this.router.navigate(['/auth/login']); }
    });
  }

  iconMap: Record<string, string> = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    stats: '<path d="M4 20V10M10 20V4M16 20v-6M22 20V8"/>',
    profile: '<circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/>',
    sessions: '<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V8a5 5 0 0 1 10 0v3"/>',
    users: '<circle cx="9" cy="7" r="4"/><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="17" cy="11" r="3"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
    roles: '<path d="M12 3 5 6v5c0 5 3.6 9.4 7 10 3.4-.6 7-5 7-10V6l-7-3Z"/><path d="M9.5 12l2 2 3.5-3.5"/>',
    permissions: '<circle cx="9" cy="12" r="4"/><path d="M13 12h7v2h-2v2h-2v-2h-3z"/>',
    audit: '<path d="M8 8h8M8 12h6M8 16h8"/><circle cx="18" cy="8" r="1.5"/><circle cx="18" cy="16" r="1.5"/>',
    categories: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    fallback: '<rect x="4" y="4" width="16" height="16" rx="4"/>'
  };


  private iconCache = new Map<string, SafeHtml>();

  getIcon(name: string): SafeHtml {
    const raw = this.iconMap[name] || this.iconMap['fallback'];
    if (this.iconCache.has(raw)) return this.iconCache.get(raw)!;
    const safe = this.sanitizer.bypassSecurityTrustHtml(raw);
    this.iconCache.set(raw, safe);
    return safe;
  }

  onCloseSidebar() {
    if (this.mobileSidebarOpen()) this.closeSidebar.emit();
  }
}
