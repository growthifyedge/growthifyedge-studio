import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TestimonialService } from '../../core/services/testimonial.service';
import { Testimonial } from '../../core/models/software.model';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'ge-admin-testimonials',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, PageHeader, EmptyState, Icon],
  templateUrl: './admin-testimonials.html'
})
export class AdminTestimonials {
  private readonly svc = inject(TestimonialService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly all = this.svc.testimonials;
  protected readonly counts = computed(() => {
    const list = this.all();
    return { total: list.length, featured: list.filter((t) => t.featured).length };
  });

  /** id currently being edited, or null when the form creates a new entry. */
  protected readonly editingId = signal<string | null>(null);
  protected readonly pendingDelete = signal<string | null>(null);

  protected readonly form = this.fb.group({
    clientName: this.fb.control('', Validators.required),
    company: this.fb.control('', Validators.required),
    designation: this.fb.control(''),
    photo: this.fb.control(''),
    rating: this.fb.control(5, [Validators.min(1), Validators.max(5)]),
    review: this.fb.control('', Validators.required),
    featured: this.fb.control(false)
  });

  protected edit(t: Testimonial): void {
    this.editingId.set(t.id);
    this.form.setValue({
      clientName: t.clientName,
      company: t.company,
      designation: t.designation,
      photo: t.photo,
      rating: t.rating,
      review: t.review,
      featured: t.featured
    });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected resetForm(): void {
    this.editingId.set(null);
    this.form.reset({ clientName: '', company: '', designation: '', photo: '', rating: 5, review: '', featured: false });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const id = this.editingId();
    if (id) this.svc.update(id, value);
    else this.svc.create(value);
    this.resetForm();
  }

  protected toggleFeatured(id: string): void {
    this.svc.toggleFeatured(id);
  }

  protected confirmDelete(id: string): void {
    this.svc.remove(id);
    if (this.editingId() === id) this.resetForm();
    this.pendingDelete.set(null);
  }

  protected stars(n: number): readonly number[] {
    return Array.from({ length: Math.max(1, Math.min(5, n)) });
  }
}
