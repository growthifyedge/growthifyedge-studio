/**
 * Client inquiry domain types (Phase 6.3).
 *
 * Inquiries are submitted by anonymous visitors from a project page and managed
 * by the admin. The shape maps 1:1 to the future `inquiries` table so cloud
 * mode is a drop-in (see supabase/inquiries.sql).
 */
export type InquiryType = 'Demo' | 'Quotation' | 'Contact';

export type InquiryStatus = 'New' | 'Contacted' | 'Quoted' | 'Closed' | 'Archived';

export interface Inquiry {
  readonly id: string;
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly phone: string;
  readonly type: InquiryType;
  /** Selected project (may be null for a general contact). */
  readonly projectId: string | null;
  /** Denormalized project name for display without a join. */
  readonly projectName: string;
  readonly message: string;
  readonly status: InquiryStatus;
  readonly createdAt: string;
}

export const INQUIRY_TYPES: readonly { value: InquiryType; label: string }[] = [
  { value: 'Demo', label: 'Request Demo' },
  { value: 'Quotation', label: 'Request Quotation' },
  { value: 'Contact', label: 'Contact Developer' }
];

export const INQUIRY_STATUSES: readonly InquiryStatus[] = [
  'New',
  'Contacted',
  'Quoted',
  'Closed',
  'Archived'
];
