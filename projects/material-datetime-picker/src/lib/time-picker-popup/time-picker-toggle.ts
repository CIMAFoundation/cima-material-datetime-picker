import { booleanAttribute, ChangeDetectorRef, Component, effect, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CimaTimePickerPopup } from './time-picker-popup';

/** Keyboard-accessible icon trigger for an associated time popup. */
@Component({
  selector: 'cima-time-picker-toggle',
  imports: [MatButtonModule],
  template: `<button type="button" matIconButton [disabled]="disabled() || picker().disabled || !picker().control || picker().control!.isDisabled"
    [attr.aria-label]="picker().labels.selectTime || picker().intl.selectTime" aria-haspopup="dialog"
    [attr.aria-expanded]="picker().isOpen()" [attr.aria-controls]="picker().isOpen() ? picker().id : null"
    (click)="open($event)">
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 3" />
    </svg>
  </button>`,
  host: { style: 'display: inline-flex' },
})
export class CimaTimePickerToggle {
  readonly picker = input.required<CimaTimePickerPopup>({ alias: 'for' });
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Refreshes the accessible label when the associated popup's translations change. */
  constructor() {
    const changeDetector = inject(ChangeDetectorRef);
    effect(onCleanup => {
      const subscription = this.picker().intl.changes.subscribe(() => changeDetector.markForCheck());
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /** Restores focus to the native trigger rather than the Material button directive. */
  open(event: Event): void { this.picker().open(event.currentTarget as HTMLElement); }
}
