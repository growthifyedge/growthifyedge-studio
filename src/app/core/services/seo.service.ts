import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

import { Software } from '../models/software.model';

/**
 * Per-page SEO (Phase 6). Sets the document title + meta description, Open
 * Graph + Twitter Card tags, a canonical link, and JSON-LD structured data —
 * all derived from existing project fields, so no schema/model change and full
 * backward compatibility. Client-rendered (SPA); JS-executing crawlers pick it
 * up. For full crawler coverage, SSR/prerender is a Phase-7 recommendation.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  private static readonly SITE = 'GrowthifyEdge Studio';
  private static readonly LD_ID = 'ge-ld-json';

  /** Apply SEO for a specific project page. */
  setProject(sw: Software): void {
    const url = this.currentUrl();
    const title = `${sw.name} — ${sw.category} · ${SeoService.SITE}`;
    const description = this.clip(sw.tagline || sw.description, 160);
    const image = sw.coverImage || '';

    this.title.setTitle(title);
    this.name('description', description);

    this.prop('og:type', 'website');
    this.prop('og:site_name', SeoService.SITE);
    this.prop('og:title', title);
    this.prop('og:description', description);
    this.prop('og:url', url);
    if (image) this.prop('og:image', image);

    this.name('twitter:card', image ? 'summary_large_image' : 'summary');
    this.name('twitter:title', title);
    this.name('twitter:description', description);
    if (image) this.name('twitter:image', image);

    this.setCanonical(url);
    this.setJsonLd(this.buildJsonLd(sw, url, image, description));
  }

  /** Restore site-level defaults (call when leaving a project page). */
  reset(): void {
    const title = `${SeoService.SITE} — Premium Software Portfolio`;
    const description =
      'A premium showcase of software products, AI tools, automations and client case studies by GrowthifyEdge.';
    this.title.setTitle(title);
    this.name('description', description);
    this.prop('og:title', title);
    this.prop('og:description', description);
    this.prop('og:url', this.currentUrl());
    this.name('twitter:title', title);
    this.name('twitter:description', description);
    this.setCanonical(this.currentUrl());
    this.removeJsonLd();
  }

  // --- internals ----------------------------------------------------------

  private buildJsonLd(sw: Software, url: string, image: string, description: string): object {
    const ld: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: sw.name,
      description,
      applicationCategory: sw.category,
      operatingSystem: 'Web',
      url,
      provider: { '@type': 'Organization', name: 'GrowthifyEdge', url: this.origin() }
    };
    if (image) ld['image'] = image;
    if (sw.rating > 0) {
      ld['aggregateRating'] = {
        '@type': 'AggregateRating',
        ratingValue: sw.rating,
        bestRating: 5,
        ratingCount: Math.max(sw.clients, 1)
      };
    }
    return ld;
  }

  private name(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }
  private prop(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private setCanonical(url: string): void {
    const head = this.doc.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(obj: object): void {
    let script = this.doc.getElementById(SeoService.LD_ID) as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.id = SeoService.LD_ID;
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(obj);
  }

  private removeJsonLd(): void {
    this.doc.getElementById(SeoService.LD_ID)?.remove();
  }

  private currentUrl(): string {
    return this.doc.location?.href ?? '';
  }
  private origin(): string {
    return this.doc.location?.origin ?? '';
  }
  private clip(s: string, n: number): string {
    return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
  }
}
