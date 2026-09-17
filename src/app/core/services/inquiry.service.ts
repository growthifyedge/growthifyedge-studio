import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { Inquiry, InquiryStatus, InquiryType } from '../models/inquiry.model';
import { SupabaseClientService } from './supabase-client.service';
import { AuthService } from './auth.service';

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
  private readonly cloud = inject(SupabaseClientService);
  private readonly auth = inject(AuthService);
  private static readonly KEY = 'growthifyedge.inquiries.v1';

  private readonly _inquiries = signal<Inquiry[]>(this.load());
  readonly inquiries = this._inquiries.asReadonly();

  readonly total = computed(() => this._inquiries().length);
  readonly openCount = computed(
    () => this._inquiries().filter((i) => i.status !== 'Closed' && i.status !== 'Archived').length
  );

  constructor() {
    effect(() => this.save(this._inquiries()));
    effect(() => {
      if (this.cloud.enabled && this.auth.isAuthenticated()) void this.refreshFromCloud();
    });
  }

  /** Create a new inquiry (status defaults to New). Safe for anonymous use. */
  create(input: InquiryInput): Inquiry {
    const inquiry = this.toInquiry(input);
    this._inquiries.update((list) => [inquiry, ...list]);
    if (this.cloud.enabled) {
      void this.submitToCloud(inquiry).catch(() => {});
    }
    return inquiry;
  }

  /**
   * Durable submission for forms that need to show success only after the
   * Supabase inquiry RPC accepts the record. Existing callers can retain the
   * optimistic `create` flow above.
   */
  async submit(input: InquiryInput): Promise<Inquiry> {
    const inquiry = this.toInquiry(input);
    if (this.cloud.enabled) await this.submitToCloud(inquiry);
    this._inquiries.update((list) => [inquiry, ...list]);
    return inquiry;
  }

  private toInquiry(input: InquiryInput): Inquiry {
    return {
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
  }

  private submitToCloud(inquiry: Inquiry): Promise<void> {
    return this.cloud.rpc('submit_inquiry', {
      p_name: inquiry.name, p_company: inquiry.company, p_email: inquiry.email,
      p_phone: inquiry.phone, p_type: inquiry.type, p_project_id: inquiry.projectId ?? '',
      p_project_name: inquiry.projectName, p_message: inquiry.message
    });
  }

  updateStatus(id: string, status: InquiryStatus): void {
    this._inquiries.update((list) =>
      list.map((i) => (i.id === id ? { ...i, status } : i))
    );
    if (this.cloud.enabled && this.auth.isAuthenticated()) {
      void this.cloud.patch<InquiryRow>('inquiries', 'id', id, { status }).catch(() => {});
    }
  }

  archive(id: string): void {
    this.updateStatus(id, 'Archived');
  }

  remove(id: string): void {
    this._inquiries.update((list) => list.filter((i) => i.id !== id));
    if (this.cloud.enabled && this.auth.isAuthenticated()) {
      void this.cloud.remove('inquiries', 'id', id).catch(() => {});
    }
  }

  private async refreshFromCloud(): Promise<void> {
    try {
      const rows = await this.cloud.select<InquiryRow>('inquiries', 'select=*&order=created_at.desc');
      this._inquiries.set(rows.map((row) => ({
        id: row.id, name: row.name, company: row.company ?? '', email: row.email,
        phone: row.phone ?? '', type: row.type as InquiryType, projectId: row.project_id,
        projectName: row.project_name ?? '', message: row.message,
        status: row.status as InquiryStatus, createdAt: row.created_at
      })));
    } catch {
      /* Keep the local cache when the cloud is unavailable or access is denied. */
    }
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

interface InquiryRow {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  type: string;
  project_id: string | null;
  project_name: string | null;
  message: string;
  status: string;
  created_at: string;
}
