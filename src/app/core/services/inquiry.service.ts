import { Injectable, computed, effect, signal } from '@angular/core';

import { Inquiry, InquiryStatus, InquiryType } from '../models/inquiry.model';

export interface InquiryInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  type: InquiryType;
  projectId: string | null;
  projectName: string;
  message: string;
}

/**
 * Client inquiries (Phase 6.3).
 *
 * localStorage-first signal store (mirrors AnalyticsService). Anonymous
 * visitors create inquiries; the admin reads/updates/archives them. Cloud mode
 * (a Supabase RPC → `inquiries`) is prepared in supabase/inquiries.sql and can
 * be wired later without changing callers.
 */
@Injectable({ providedIn: 'root' })
export class InquiryService {
  private static readonly KEY = 'growthifyedge.inquiries.v1';

  private readonly _inquiries = signal<Inquiry[]>(this.load());
  readonly inquiries = this._inquiries.asReadonly();

  readonly total = computed(() => this._inquiries().length);
  readonly openCount = computed(
    () => this._inquiries().filter((i) => i.status !== 'Closed' && i.status !== 'Archived').length
  );

  constructor() {
    effect(() => this.save(this._inquiries()));
  }

  /** Create a new inquiry (status defaults to New). Safe for anonymous use. */
  create(input: InquiryInput): Inquiry {
    const inquiry: Inquiry = {
      id: `inq-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name.trim(),
      company: input.company.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      type: input.type,
      projectId: input.projectId,
      projectName: input.projectName,
      message: input.message.trim(),
      status: 'New',
      createdAt: new Date().toISOString()
    };
    this._inquiries.update((list) => [inquiry, ...list]);
    return inquiry;
  }

  updateStatus(id: string, status: InquiryStatus): void {
    this._inquiries.update((list) =>
      list.map((i) => (i.id === id ? { ...i, status } : i))
    );
  }

  archive(id: string): void {
    this.updateStatus(id, 'Archived');
  }

  remove(id: string): void {
    this._inquiries.update((list) => list.filter((i) => i.id !== id));
  }

  // --- persistence --------------------------------------------------------

  private load(): Inquiry[] {
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem(InquiryService.KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Inquiry[]) : [];
    } catch {
      return [];
    }
  }

  private save(list: readonly Inquiry[]): void {
    try {
      localStorage.setItem(InquiryService.KEY, JSON.stringify(list));
    } catch {
      /* quota / privacy mode */
    }
  }
}
