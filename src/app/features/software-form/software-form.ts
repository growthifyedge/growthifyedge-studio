import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  effect,
  inject,
  input,
  signal
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { SoftwareService } from '../../core/services/software.service';
import {
  DemoCategory,
  PricingModel,
  Screenshot,
  Software,
  SoftwareCategory,
  SoftwareStatus,
  Visibility
} from '../../core/models/software.model';
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from '../../core/models/filters.model';
import { MediaUploadService } from '../../core/services/media-upload.service';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { Icon } from '../../shared/components/icon/icon';
import { SoftwareCard } from '../../shared/components/software-card/software-card';
import { OverlayPortal } from '../../shared/directives/overlay-portal.directive';

interface SoftwareFormModel {
  name: FormControl<string>;
  slug: FormControl<string>;
  tagline: FormControl<string>;
  description: FormControl<string>;
  longDescription: FormControl<string>;
  problem: FormControl<string>;
  solution: FormControl<string>;
  manualPainPoints: FormControl<string>;
  category: FormControl<SoftwareCategory>;
  demoCategory: FormControl<DemoCategory>;
  status: FormControl<SoftwareStatus>;
  visibility: FormControl<Visibility>;
  pricing: FormControl<PricingModel>;
  featured: FormControl<boolean>;
  accentColor: FormControl<string>;
  accentColor2: FormControl<string>;
  coverImage: FormControl<string>;
  videoUrl: FormControl<string>;
  teaserVideoUrl: FormControl<string>;
  walkthroughVideoUrl: FormControl<string>;
  screenshots: FormControl<string>;
  liveUrl: FormControl<string>;
  caseStudyUrl: FormControl<string>;
  repoUrl: FormControl<string>;
  isMini: FormControl<boolean>;
  rating: FormControl<number>;
  clients: FormControl<number>;
  impactScore: FormControl<number>;
  timeSaved: FormControl<string>;
  headlineValue: FormControl<string>;
  headlineLabel: FormControl<string>;
  tags: FormControl<string>;
  techStack: FormControl<string>;
  keyFeatures: FormControl<string>;
}

@Component({
  selector: 'ge-software-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, PageHeader, Icon, SoftwareCard, OverlayPortal],
  templateUrl: './software-form.html'
})
export class SoftwareForm {
  /** `:id` route param — present only in edit mode. */
  readonly id = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly svc = inject(SoftwareService);
  private readonly router = inject(Router);
  private readonly media = inject(MediaUploadService);

  /** True when Supabase Storage is configured — enables real file uploads. */
  protected readonly uploadsEnabled = this.media.enabled;
  protected readonly uploading = signal(false);
  protected readonly uploadError = signal<string | null>(null);

  protected readonly categories = CATEGORY_OPTIONS.filter((c) => c !== 'All');
  protected readonly statuses = STATUS_OPTIONS.filter((s) => s !== 'All');
  protected readonly pricings: readonly PricingModel[] = ['Free', 'Subscription', 'One-time', 'Custom Quote'];
  protected readonly demoCategories: readonly DemoCategory[] = ['AI Automation', 'Customer Support', 'E-commerce', 'Operations', 'Mini Demo'];
  protected readonly visibilities: readonly { value: Visibility; label: string; hint: string }[] = [
    { value: 'public', label: 'Public', hint: 'Visible to everyone' },
    { value: 'client-only', label: 'Client-only', hint: 'Visible to invited clients' },
    { value: 'private', label: 'Private', hint: 'Only your team' }
  ];

  protected readonly editing = computed(() => !!this.id());
  protected readonly saved = signal(false);

  /** Holds a built Software object for the "preview before publishing" modal. */
  protected readonly preview = signal<Software | null>(null);

  protected readonly form: FormGroup<SoftwareFormModel> = this.fb.group<SoftwareFormModel>({
    name: this.fb.control('', { validators: [Validators.required, Validators.minLength(2)] }),
    slug: this.fb.control('', { validators: [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)] }),
    tagline: this.fb.control('', { validators: [Validators.required, Validators.maxLength(140)] }),
    description: this.fb.control('', { validators: [Validators.required] }),
    longDescription: this.fb.control(''),
    problem: this.fb.control(''),
    solution: this.fb.control(''),
    manualPainPoints: this.fb.control(''),
    category: this.fb.control<SoftwareCategory>('AI Tool', { validators: [Validators.required] }),
    demoCategory: this.fb.control<DemoCategory>('AI Automation', { validators: [Validators.required] }),
    status: this.fb.control<SoftwareStatus>('In Development', { validators: [Validators.required] }),
    visibility: this.fb.control<Visibility>('public', { validators: [Validators.required] }),
    pricing: this.fb.control<PricingModel>('Subscription', { validators: [Validators.required] }),
    featured: this.fb.control(false),
    accentColor: this.fb.control('#6d49ff'),
    accentColor2: this.fb.control('#f43bb8'),
    coverImage: this.fb.control('https://picsum.photos/seed/new-software/1200/800'),
    videoUrl: this.fb.control(''),
    teaserVideoUrl: this.fb.control(''),
    walkthroughVideoUrl: this.fb.control(''),
    screenshots: this.fb.control(''),
    liveUrl: this.fb.control(''),
    caseStudyUrl: this.fb.control(''),
    repoUrl: this.fb.control(''),
    isMini: this.fb.control(false),
    rating: this.fb.control(4.5, { validators: [Validators.min(0), Validators.max(5)] }),
    clients: this.fb.control(0, { validators: [Validators.min(0)] }),
    impactScore: this.fb.control(80, { validators: [Validators.min(0), Validators.max(100)] }),
    timeSaved: this.fb.control('10 hrs / week'),
    headlineValue: this.fb.control('−50%'),
    headlineLabel: this.fb.control('manual work'),
    tags: this.fb.control(''),
    techStack: this.fb.control(''),
    keyFeatures: this.fb.control('')
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;
      const existing = this.svc.getById(id);
      if (existing) this.patchFrom(existing);
    });

    // Auto-suggest a slug from the name until the slug is edited directly.
    const nameCtrl = this.form.controls.name;
    const slugCtrl = this.form.controls.slug;
    nameCtrl.valueChanges.subscribe((name) => {
      if (!slugCtrl.dirty && !this.editing()) {
        slugCtrl.setValue(this.toSlug(name), { emitEvent: false });
      }
    });
  }

  protected controlInvalid(name: keyof SoftwareFormModel): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const software = this.toSoftware();
    if (this.editing()) this.svc.update(software.id, software);
    else this.svc.create(software);

    this.saved.set(true);
    setTimeout(() => this.router.navigate(['/studio']), 750);
  }

  // --- Optional media uploads (Supabase Storage) --------------------------

  protected async onThumbnailFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.uploadsEnabled) return;
    this.uploading.set(true);
    this.uploadError.set(null);
    try {
      const url = await this.media.uploadImage(file, 'thumbnails');
      this.form.controls.coverImage.setValue(url);
    } catch {
      this.uploadError.set('Thumbnail upload failed. Check your Supabase Storage setup.');
    } finally {
      this.uploading.set(false);
    }
  }

  protected async onScreenshotFiles(event: Event): Promise<void> {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    if (!files.length || !this.uploadsEnabled) return;
    this.uploading.set(true);
    this.uploadError.set(null);
    try {
      const urls = await this.media.uploadMany(files, 'screenshots');
      const existing = this.form.controls.screenshots.value.trim();
      const merged = [existing, ...urls].filter(Boolean).join('\n');
      this.form.controls.screenshots.setValue(merged);
    } catch {
      this.uploadError.set('Screenshot upload failed. Check your Supabase Storage setup.');
    } finally {
      this.uploading.set(false);
    }
  }

  protected async onVideoFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.uploadsEnabled) return;
    this.uploading.set(true);
    this.uploadError.set(null);
    try {
      const url = await this.media.uploadVideo(file, 'videos');
      this.form.controls.videoUrl.setValue(url);
    } catch (e) {
      this.uploadError.set(
        e instanceof Error ? e.message : 'Video upload failed. Check your Supabase Storage setup.'
      );
    } finally {
      this.uploading.set(false);
    }
  }

  /** Build the project from current values and show it as it will appear. */
  protected openPreview(): void {
    this.preview.set(this.toSoftware());
  }
  protected closePreview(): void {
    this.preview.set(null);
  }
  /** Save straight from the preview modal. */
  protected publishFromPreview(): void {
    this.closePreview();
    this.submit();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.preview()) this.closePreview();
  }

  // --- helpers -----------------------------------------------------------

  private patchFrom(s: Software): void {
    this.form.patchValue({
      name: s.name,
      slug: s.slug,
      tagline: s.tagline,
      description: s.description,
      longDescription: s.longDescription,
      problem: s.problem,
      solution: s.solution,
      manualPainPoints: s.manualPainPoints.join('\n'),
      category: s.category,
      demoCategory: s.demoCategory,
      status: s.status,
      visibility: s.visibility,
      pricing: s.pricing,
      featured: s.featured,
      accentColor: s.accentColor,
      accentColor2: s.accentColor2,
      coverImage: s.coverImage,
      videoUrl: s.demoVideoUrl ?? s.videos[0]?.url ?? '',
      teaserVideoUrl: s.teaserVideoUrl ?? '',
      walkthroughVideoUrl: s.walkthroughVideoUrl ?? '',
      screenshots: s.screenshots.map((sc) => sc.url).join('\n'),
      liveUrl: s.liveUrl ?? '',
      caseStudyUrl: s.caseStudyUrl ?? '',
      repoUrl: s.repoUrl ?? '',
      isMini: !!s.isMini,
      rating: s.rating,
      clients: s.clients,
      impactScore: s.impactScore,
      timeSaved: s.timeSaved,
      headlineValue: s.headlineMetric.value,
      headlineLabel: s.headlineMetric.label,
      tags: s.tags.join(', '),
      techStack: s.techStack.map((t) => t.name).join(', '),
      keyFeatures: s.keyFeatures.join('\n')
    });
  }

  private toSoftware(): Software {
    const v = this.form.getRawValue();
    const now = new Date().toISOString().slice(0, 10);
    const existing = this.id() ? this.svc.getById(this.id()!) : undefined;
    const headline = { label: v.headlineLabel, value: v.headlineValue, trend: 'up' as const, icon: '⚡' };

    return {
      id: existing?.id ?? `sw-${Math.random().toString(36).slice(2, 8)}`,
      slug: v.slug,
      name: v.name,
      tagline: v.tagline,
      description: v.description,
      longDescription: v.longDescription || v.description,
      problem: v.problem || 'Manual, repetitive work slows the team down.',
      manualPainPoints: this.lines(v.manualPainPoints),
      solution: v.solution || v.description,
      category: v.category,
      demoCategory: v.demoCategory,
      status: v.status,
      visibility: v.visibility,
      featured: v.featured,
      coverImage: v.coverImage,
      accentColor: v.accentColor,
      accentColor2: v.accentColor2,
      isMini: v.isMini,
      techStack: this.splitList(v.techStack).map((name) => ({ name })),
      screenshots: this.toScreenshots(v.screenshots, v.name, existing?.screenshots),
      videos: v.videoUrl
        ? [
            {
              id: existing?.videos[0]?.id ?? `vid-${Math.random().toString(36).slice(2, 7)}`,
              title: `${v.name} — Demo`,
              url: v.videoUrl,
              thumbnail: v.coverImage,
              durationSeconds: existing?.videos[0]?.durationSeconds ?? 60
            }
          ]
        : (existing?.videos ?? []),
      impact: existing ? [headline, ...existing.impact.slice(1)] : [headline],
      keyFeatures: this.lines(v.keyFeatures),
      headlineMetric: headline,
      timeSaved: v.timeSaved,
      ioExample: existing?.ioExample,
      liveUrl: v.liveUrl || undefined,
      repoUrl: v.repoUrl || undefined,
      caseStudyUrl: v.caseStudyUrl || undefined,
      demoVideoUrl: v.videoUrl || undefined,
      teaserVideoUrl: v.teaserVideoUrl || undefined,
      walkthroughVideoUrl: v.walkthroughVideoUrl || undefined,
      pricing: v.pricing,
      rating: Number(v.rating),
      clients: Number(v.clients),
      impactScore: Number(v.impactScore),
      launchedAt: existing?.launchedAt ?? now,
      updatedAt: now,
      tags: this.splitList(v.tags).map((t) => t.toLowerCase())
    };
  }

  private toScreenshots(
    value: string,
    name: string,
    existing?: readonly Screenshot[]
  ): Screenshot[] {
    return this.lines(value).map((url, i) => ({
      id: existing?.[i]?.id ?? `ss-${Math.random().toString(36).slice(2, 7)}`,
      url,
      thumbnail: url,
      caption: existing?.[i]?.caption ?? `${name} screenshot ${i + 1}`
    }));
  }

  private splitList(value: string): string[] {
    return value.split(',').map((s) => s.trim()).filter(Boolean);
  }
  private lines(value: string): string[] {
    return value.split('\n').map((s) => s.trim()).filter(Boolean);
  }
  private toSlug(value: string): string {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
}
