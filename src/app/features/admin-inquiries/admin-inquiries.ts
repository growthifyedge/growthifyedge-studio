import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { InquiryService } from '../../core/services/inquiry.service';
import {
  Inquiry,
  InquiryStatus,
  InquiryType,
  INQUIRY_STATUSES,
  INQUIRY_TYPES
} from '../../core/models/inquiry.model';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Icon } from '../../shared/components/icon/icon';

@Component({
  selector: 'ge-admin-inquiries',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeader, EmptyState, Icon],
  templateUrl: './admin-inquiries.html'
})
export class AdminInquiries {
  private readonly svc = inject(InquiryService);

  protected readonly statuses = INQUIRY_STATUSES;
  protected readonly types = INQUIRY_TYPES;

  protected readonly all = this.svc.inquiries;

  protected readonly status = signal<InquiryStatus | 'All'>('All');
  protected readonly type = signal<InquiryType | 'All'>('All');
  protected readonly project = signal<string>('All');

  /** Distinct project names present in the inquiry list, for the filter. */
  protected readonly projectOptions = computed<readonly string[]>(() => {
    const set = new Set(this.all().map((i) => i.projectName).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  protected readonly filtered = computed<readonly Inquiry[]>(() => {
    const s = this.status();
    const t = this.type();
    const p = this.project();
    return this.all().filter(
      (i) =>
        (s === 'All' || i.status === s) &&
        (t === 'All' || i.type === t) &&
        (p === 'All' || i.projectName === p)
    );
  });

  protected readonly counts = computed(() => {
    const list = this.all();
    return {
      total: list.length,
      newCount: list.filter((i) => i.status === 'New').length,
      open: list.filter((i) => i.status !== 'Closed' && i.status !== 'Archived').length,
      archived: list.filter((i) => i.status === 'Archived').length
    };
  });

  protected readonly pendingDelete = signal<string | null>(null);

  protected setStatus(v: string): void {
    this.status.set(v as InquiryStatus | 'All');
  }
  protected setType(v: string): void {
    this.type.set(v as InquiryType | 'All');
  }
  protected setProject(v: string): void {
    this.project.set(v);
  }

  protected changeStatus(id: string, v: string): void {
    this.svc.updateStatus(id, v as InquiryStatus);
  }
  protected archive(id: string): void {
    this.svc.archive(id);
  }
  protected confirmDelete(id: string): void {
    this.svc.remove(id);
    this.pendingDelete.set(null);
  }

  protected statusClass(s: InquiryStatus): string {
    switch (s) {
      case 'New':
        return 'bg-brand-50 text-brand-700 ring-brand-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 ring-amber-200';
      case 'Quoted':
        return 'bg-violet-50 text-violet-700 ring-violet-200';
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
      case 'Archived':
      default:
        return 'bg-slate-100 text-slate-500 ring-slate-200';
    }
  }

  protected shortDate(iso: string): string {
    return iso.slice(0, 10);
  }
}
