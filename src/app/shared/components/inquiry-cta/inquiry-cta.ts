import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
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

import { Software } from '../../../core/models/software.model';
import { InquiryType, INQUIRY_TYPES } from '../../../core/models/inquiry.model';
import { InquiryService } from '../../../core/services/inquiry.service';
import { SoftwareService } from '../../../core/services/software.service';
import { Icon } from '../icon/icon';
import { OverlayPortal } from '../../directives/overlay-portal.directive';

interface InquiryFormModel {
  name: FormControl<string>;
  company: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  type: FormControl<InquiryType>;
  projectId: FormControl<string>;
  message: FormControl<string>;
}

/**
 * Client inquiry call-to-action: three buttons (Request Demo / Request
 * Quotation / Contact Developer) that open a portalled modal form, creating an
 * inquiry record via {@link InquiryService}. Additive — reused on the detail
 * and presentation pages; no page redesign.
 */
@Component({
  selector: 'ge-inquiry-cta',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, OverlayPortal],
  templateUrl: './inquiry-cta.html'
})
export class InquiryCta {
  readonly project = input.required<Software>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly inquiries = inject(InquiryService);
  private readonly svc = inject(SoftwareService);

  protected readonly types = INQUIRY_TYPES;
  protected readonly open = signal<InquiryType | null>(null);
  protected readonly submitted = signal(false);

  /** The current project always appears, plus any other viewable projects. */
  protected readonly projectOptions = computed<readonly Software[]>(() => {
    const current = this.project();
    return [current, ...this.svc.visibleSoftware().filter((s) => s.id !== current.id)];
  });

  protected readonly form: FormGroup<InquiryFormModel> = this.fb.group<InquiryFormModel>({
    name: this.fb.control('', { validators: [Validators.required, Validators.minLength(2)] }),
    company: this.fb.control(''),
    email: this.fb.control('', { validators: [Validators.required, Validators.email] }),
    phone: this.fb.control(''),
    type: this.fb.control<InquiryType>('Demo', { validators: [Validators.required] }),
    projectId: this.fb.control(''),
    message: this.fb.control('', { validators: [Validators.required, Validators.minLength(5)] })
  });

  protected label(type: InquiryType): string {
    return this.types.find((t) => t.value === type)?.label ?? 'Inquiry';
  }

  protected launch(type: InquiryType): void {
    this.submitted.set(false);
    this.form.reset({
      name: '',
      company: '',
      email: '',
      phone: '',
      type,
      projectId: this.project().id,
      message: ''
    });
    this.open.set(type);
  }

  protected close(): void {
    this.open.set(null);
  }

  protected invalid(name: keyof InquiryFormModel): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const project = this.projectOptions().find((p) => p.id === v.projectId);
    this.inquiries.create({
      name: v.name,
      company: v.company,
      email: v.email,
      phone: v.phone,
      type: v.type,
      projectId: v.projectId || null,
      projectName: project?.name ?? this.project().name,
      message: v.message
    });
    this.submitted.set(true);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open()) this.close();
  }
}
