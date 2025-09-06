import { Injectable, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ProfileService } from './profile.service';
import { AuthService } from './auth.service';
import { Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserSyncService {
  private lastSync = 0;
  private readonly cooldown = 5000; // 5 seconds
  private syncing = false;
  private subs = new Subscription();

  constructor(
    private router: Router,
    private profile: ProfileService,
    private auth: AuthService,
    private zone: NgZone
  ) {
    this.init();
  }

  private init(): void {
    this.subs.add(
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd)
      ).subscribe((ev: any) => {
        if (ev.urlAfterRedirects?.startsWith('/auth')) return;
        this.ensureSync();
      })
    );

    const handler = () => {
      if (document.hidden) return;
      this.ensureSync();
    };
    this.zone.runOutsideAngular(() => {
      window.addEventListener('focus', handler);
      document.addEventListener('visibilitychange', handler);
      this.subs.add({
        unsubscribe: () => {
          window.removeEventListener('focus', handler);
          document.removeEventListener('visibilitychange', handler);
        }
      });
    });

    this.ensureSync(true);
  }

  trigger(force = false) {
    this.ensureSync(force);
  }

  private ensureSync(force = false): void {
    if (!this.auth.isAuth()) return;
    const now = Date.now();
    if (!force && (now - this.lastSync) < this.cooldown) return;
    if (this.syncing) return;

    this.syncing = true;
    this.profile.getProfile().subscribe({
      next: () => {
        this.lastSync = Date.now();
        this.syncing = false;
      },
      error: () => {
        this.syncing = false;
      }
    });
  }
}