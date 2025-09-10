import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-category-tree',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-tree.html',
  styleUrls: ['./category-tree.scss']
})
export class CategoryTree implements OnInit {
  private api = inject(CategoryService);
  private router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);
  nodes = signal<Category[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.tree()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => this.nodes.set(res.data || []),
        error: e => this.error.set(e?.error?.error?.message || 'Failed to load category tree')
      });
  }

  goBack(): void {
    this.router.navigate(['/categories']);
  }

  trackById = (_: number, c: Category) => c._id;
}