import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../../core/models/category.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './category-form.html',
  styleUrls: ['./category-form.scss']
})
export class CategoryForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CategoryService);

  form!: FormGroup;
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  id = signal<string | null>(null);
  fromDetail = signal(false);

  parentOptions = signal<Category[]>([]);
  private excludedParentIds = signal<Set<string>>(new Set());

  isEdit = computed(() => !!this.id());
  title = computed(() => this.isEdit() ? 'Edit Category' : 'Create Category');
  submitLabel = computed(() => this.isEdit() ? 'Save Changes' : 'Create Category');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.id.set(id);

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    this.fromDetail.set(!!state?.fromDetail);

    this.buildForm();
    this.loadParents();

    if (this.isEdit()) {
      this.loadItem();
    } else {
      this.loading.set(false);
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      parent: [null as string | null],
      description: ['', [Validators.maxLength(255)]]
    });
  }

  private loadParents(): void {
    this.api.tree().subscribe({
      next: res => {
        const nodes = res.data || [];
        const all = this.flattenTree(nodes);
        this.parentOptions.set(all);
        if (this.isEdit() && this.id()) {
          const deny = this.getDescendantIds(this.id()!, nodes);
          deny.add(this.id()!);
          this.excludedParentIds.set(deny);
        } else {
          this.excludedParentIds.set(new Set());
        }
      },
      error: () => {
        this.parentOptions.set([]);
        this.excludedParentIds.set(new Set());
      }
    });
  }

  private flattenTree(nodes: Category[]): Category[] {
    const out: Category[] = [];
    const walk = (n: Category[]) => {
      for (const x of n) {
        out.push(x);
        if (x.children?.length) walk(x.children as Category[]);
      }
    };
    walk(nodes);
    return out;
  }

  private getDescendantIds(targetId: string, nodes: Category[]): Set<string> {
    const set = new Set<string>();
    const walk = (n: Category[]) => {
      for (const x of n) {
        if (String(x._id) === String(targetId)) {
          this.collectDescendants(x, set);
        } else if (x.children?.length) {
          walk(x.children as Category[]);
        }
      }
    };
    walk(nodes);
    return set;
  }

  private collectDescendants(node: Category, out: Set<string>) {
    if (!node.children) return;
    for (const c of node.children as Category[]) {
      out.add(String(c._id));
      this.collectDescendants(c, out);
    }
  }

  isInvalidParentOption = (cat: Category) => this.excludedParentIds().has(String(cat._id));

  private loadItem(): void {
    this.api.getById(this.id()!)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          const c = res.data as any;
          this.form.patchValue({
            name: c.name,
            parent: typeof c.parent === 'object' && c.parent ? c.parent._id : (c.parent || null),
            description: c.description || ''
          });
        },
        error: e => this.error.set(e?.error?.error?.message || 'Failed to load category')
      });
  }

  goBack(): void {
    if (this.isEdit()) {
      if (this.fromDetail()) this.router.navigate(['/categories', this.id()!]);
      else this.router.navigate(['/categories']);
    } else {
      this.router.navigate(['/categories']);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    this.saving.set(true);

    const { name, parent, description } = this.form.getRawValue() as { name: string; parent: string | null; description?: string; };

    if (!this.isEdit()) {
      const payload: CreateCategoryRequest = {
        name,
        parent: parent || null,
        description: description?.trim() || undefined
      };
      this.api.create(payload)
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => this.router.navigate(['/categories'], { state: { success: 'Category created successfully' } }),
          error: e => this.error.set(e?.error?.error?.message || 'Create failed')
        });
      return;
    }

    const updatePayload: UpdateCategoryRequest = {
      name,
      parent: parent || null,
      description: description?.trim() || undefined
    };
    this.api.update(this.id()!, updatePayload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          if (this.fromDetail()) this.router.navigate(['/categories', this.id()!], { state: { success: 'Category updated successfully' } });
          else this.router.navigate(['/categories'], { state: { success: 'Category updated successfully' } });
        },
        error: e => this.error.set(e?.error?.error?.message || 'Update failed')
      });
  }

  selfDisabledOption(cat: Category): boolean {
    return this.isInvalidParentOption(cat);
  }

  trackById = (_: number, c: Category) => c._id;
}