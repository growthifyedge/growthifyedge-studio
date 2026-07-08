import { Injectable, computed, effect, signal } from '@angular/core';

import { Testimonial } from '../models/software.model';
import { MOCK_TESTIMONIALS } from '../data/mock-software';

export interface TestimonialInput {
  clientName: string;
  company: string;
  designation: string;
  photo: string;
  rating: number;
  review: string;
  featured: boolean;
}

/**
 * Client testimonials (Phase 6.4).
 *
 * localStorage-first signal store (mirrors {@link InquiryService}). Seeded from
 * MOCK_TESTIMONIALS on first run so the public Case Studies page is never empty.
 * The admin curates entries; anonymous visitors only read them. Cloud mode
 * (Supabase `testimonials`, public read + admin write) is prepared in
 * supabase/testimonials.sql and can be wired later without changing callers.
 */
@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private static readonly KEY = 'growthifyedge.testimonials.v1';

  private readonly _testimonials = signal<Testimonial[]>(this.load());
  readonly testimonials = this._testimonials.asReadonly();

  readonly total = computed(() => this._testimonials().length);
  readonly featured = computed(() => this._testimonials().filter((t) => t.featured));

  constructor() {
    effect(() => this.save(this._testimonials()));
  }

  /** Create a testimonial (defaults are already normalized by the caller). */
  create(input: TestimonialInput): Testimonial {
    const testimonial: Testimonial = {
      id: `tm-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      ...this.normalize(input)
    };
    this._testimonials.update((list) => [testimonial, ...list]);
    return testimonial;
  }

  update(id: string, input: TestimonialInput): void {
    const patch = this.normalize(input);
    this._testimonials.update((list) =>
      list.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }

  toggleFeatured(id: string): void {
    this._testimonials.update((list) =>
      list.map((t) => (t.id === id ? { ...t, featured: !t.featured } : t))
    );
  }

  remove(id: string): void {
    this._testimonials.update((list) => list.filter((t) => t.id !== id));
  }

  // --- helpers ------------------------------------------------------------

  private normalize(input: TestimonialInput): Omit<Testimonial, 'id'> {
    return {
      clientName: input.clientName.trim(),
      company: input.company.trim(),
      designation: input.designation.trim(),
      photo: input.photo.trim(),
      rating: Math.max(1, Math.min(5, Math.round(input.rating) || 5)),
      review: input.review.trim(),
      featured: !!input.featured
    };
  }

  // --- persistence --------------------------------------------------------

  private load(): Testimonial[] {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem(TestimonialService.KEY);
      if (!raw) return MOCK_TESTIMONIALS.map((t) => ({ ...t }));
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Testimonial[]) : [];
    } catch {
      return MOCK_TESTIMONIALS.map((t) => ({ ...t }));
    }
  }

  private save(list: readonly Testimonial[]): void {
    try {
      localStorage.setItem(TestimonialService.KEY, JSON.stringify(list));
    } catch {
      /* quota / privacy mode */
    }
  }
}
