import { ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild, afterNextRender, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InquiryService } from '../../../core/services/inquiry.service';
import { Icon } from '../icon/icon';
import { OverlayPortal } from '../../directives/overlay-portal.directive';

interface ProjectForm {
  name: FormControl<string>; email: FormControl<string>; phone: FormControl<string>;
  company: FormControl<string>; projectType: FormControl<string>; budget: FormControl<string>;
  message: FormControl<string>;
}

@Component({
  selector: 'ge-project-inquiry-modal', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, OverlayPortal], templateUrl: './project-inquiry-modal.html'
})
export class ProjectInquiryModal {
  readonly dismissed = output<void>();
  readonly submitted = output<void>();
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly inquiries = inject(InquiryService);
  @ViewChild('dialog') private readonly dialog?: ElementRef<HTMLElement>;

  protected readonly sending = signal(false);
  protected readonly success = signal(false);
  protected readonly error = signal(false);
  protected readonly projectTypes = ['Website', 'Custom Software', 'Dashboard / Internal System', 'Automation', 'AI / Integration', 'E-commerce', 'Other'];
  protected readonly budgets = ['Not sure yet', 'Under $5k', '$5k – $20k', '$20k – $50k', '$50k+'];
  protected readonly form: FormGroup<ProjectForm> = this.fb.group<ProjectForm>({
    name: this.fb.control('', { validators: [Validators.required, Validators.minLength(2)] }),
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    phone: this.fb.control(''), company: this.fb.control(''),
    projectType: this.fb.control('', { validators: [Validators.required] }),
    budget: this.fb.control('Not sure yet'),
    message: this.fb.control('', { validators: [Validators.required, Validators.minLength(10)] })
  });

  constructor() {
    afterNextRender(() => this.dialog?.nativeElement.querySelector<HTMLElement>('button, input, select, textarea')?.focus());
  }

  protected invalid(name: keyof ProjectForm): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  protected close(): void { this.dismissed.emit(); }

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.sending()) { this.form.markAllAsTouched(); return; }
    this.sending.set(true); this.error.set(false);
    const value = this.form.getRawValue();
    try {
      await this.inquiries.submit({
        name: value.name, email: value.email, phone: value.phone, company: value.company,
        type: 'Contact', projectId: null, projectName: value.projectType,
        message: `${value.message.trim()}\n\nProject type: ${value.projectType}\nBudget: ${value.budget || 'Not provided'}`
      });
      this.success.set(true);
      this.submitted.emit();
    } catch {
      this.error.set(true);
    } finally {
      this.sending.set(false);
    }
  }

  @HostListener('document:keydown.escape') protected onEscape(): void { this.close(); }
  @HostListener('document:keydown', ['$event']) protected trapFocus(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Tab') return;
    const root = this.dialog?.nativeElement;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
}
