import { Injectable, inject } from '@angular/core';
import { UserService } from './user.service';
import { RoleService } from './role.service';
import { PermissionService } from './permission.service';
import { CategoryService } from './category.service';
import { forkJoin, map, switchMap, of, expand, reduce, Observable, catchError } from 'rxjs';
import { User } from '../models/user.model';

interface RawTotals {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  totalCategories: number;
  users: User[];
}

export interface StatsResult {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  totalCategories: number;
  activeUsers: number;
  inactiveUsers: number;
  roleDistribution: { role: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private usersApi = inject(UserService);
  private rolesApi = inject(RoleService);
  private permsApi = inject(PermissionService);
  private catsApi = inject(CategoryService);

  loadStats(maxUserBatch = 500): Observable<StatsResult> {
    const SAFE_LIMIT = Math.min(Math.max(5, maxUserBatch), 100);
    return forkJoin({
      usersMeta: this.usersApi.list(1, SAFE_LIMIT),
      rolesMeta: this.rolesApi.list(1, 5),
      permsMeta: this.permsApi.list(1, 5),
      catsMeta: this.catsApi.list(1, 5)
    }).pipe(
      switchMap(metaRes => {
        const totalUsers = metaRes.usersMeta.meta.total;
        const totalPages = metaRes.usersMeta.meta.totalPages;

        if (!totalUsers) {
          return of({
            totalUsers: 0,
            totalRoles: metaRes.rolesMeta.meta.total,
            totalPermissions: metaRes.permsMeta.meta.total,
            totalCategories: metaRes.catsMeta.meta.total,
            users: []
          } as RawTotals);
        }

        return of({ page: 1, acc: [] as User[] }).pipe(
          expand(state => {
            if (state.page > totalPages) return of();
            return this.usersApi.list(state.page, SAFE_LIMIT).pipe(
              map(res => ({
                page: state.page + 1,
                acc: state.acc.concat(res.data)
              })),
              catchError(() => of({ page: totalPages + 1, acc: state.acc }))
            );
          }),
          reduce((_, curr) => curr),
          map(finalState => ({
            totalUsers,
            totalRoles: metaRes.rolesMeta.meta.total,
            totalPermissions: metaRes.permsMeta.meta.total,
            totalCategories: metaRes.catsMeta.meta.total,
            users: finalState?.acc || []
          }) as RawTotals)
        );
      }),
      map(raw => {
        const activeUsers = raw.users.filter(u => u.isActive).length;
        const inactiveUsers = raw.users.length - activeUsers;

        const roleCounter = new Map<string, number>();
        raw.users.forEach(u => {
          (u.roles || []).forEach(r => {
            const key = r.displayName || r.name;
            roleCounter.set(key, (roleCounter.get(key) || 0) + 1);
          });
        });

        const roleDistribution = Array.from(roleCounter.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([role, count]) => ({ role, count }));

        return {
          totalUsers: raw.totalUsers,
          totalRoles: raw.totalRoles,
          totalPermissions: raw.totalPermissions,
          totalCategories: raw.totalCategories,
          activeUsers,
          inactiveUsers,
          roleDistribution
        };
      })
    );
  }
}