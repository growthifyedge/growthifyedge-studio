import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SoftwareService } from '../../core/services/software.service';
import { PresentationService } from '../../core/services/presentation.service';
import { DemoVideo } from '../../core/models/software.model';
import { isDirectVideo, toEmbedUrl } from '../../core/utils/video-embed';
import { Icon, IconName } from '../../shared/components/icon/icon';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { ScreenshotGallery } from '../../shared/components/screenshot-gallery/screenshot-gallery';
import { VideoModal } from '../../shared/components/video-modal/video-modal';

/**
 * Client-facing presentation view for a single project.
 *
 * Renders full-bleed (no sidebar/topbar) via PresentationService, hides every
 * admin/edit control, and shows only the story a client cares about: problem,
 * solution, demo, impact, screenshots, tech stack and a CTA. A "Copy
 * presentation link" button shares the current route.
 */
@Component({
  selector: 'ge-project-presentation',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, StatusBadge, ScreenshotGallery, VideoModal],
  templateUrl: './project-presentation.html'
})
export class ProjectPresentation {
  /** Bound from the `:slug` route param via withComponentInputBinding(). */
  readonly slug = input.required<string>();

  private readonly svc = inject(SoftwareService);
  private readonly router = inject(Router);
  private readonly presentation = inject(PresentationService);

  protected readonly software = computed(() => this.svc.bySlugForViewer(this.slug()));

  protected readonly videoLinks = computed<readonly { label: string; url: string; icon: IconName }[]>(() => {
    const sw = this.software();
    if (!sw) return [];
    const links: { label: string; url: string; icon: IconName }[] = [];
    const demo = sw.demoVideoUrl ?? sw.videos[0]?.url;
    if (demo) links.push({ label: 'Watch Demo', url: demo, icon: 'play' });
    if (sw.teaserVideoUrl) links.push({ label: 'Watch Teaser', url: sw.teaserVideoUrl, icon: 'film' });
    if (sw.walkthroughVideoUrl) links.push({ label: 'Full Walkthrough', url: sw.walkthroughVideoUrl, icon: 'presentation' });
    return links;
  });

  protected readonly activeVideo = signal<DemoVideo | null>(null);
  protected readonly copied = signal(false);

  constructor() {
    this.presentation.enter();
  }

  protected launch(link: { label: string; url: string }): void {
    const sw = this.software();
    const embed = toEmbedUrl(link.url);
    if (embed || isDirectVideo(link.url)) {
      this.activeVideo.set({
        id: 'live-' + link.label,
        title: `${sw?.name ?? 'Demo'} — ${link.label}`,
        url: embed ?? link.url,
        thumbnail: sw?.coverImage ?? '',
        durationSeconds: 0
      });
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  }

  protected closeVideo(): void {
    this.activeVideo.set(null);
  }

  protected async copyLink(): Promise<void> {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API blocked — fall back to a temporary text selection.
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  @HostListener('document:keydown.escape')
  protected exit(): void {
    this.presentation.exit();
    this.router.navigate(['/software', this.slug()]);
  }
}
