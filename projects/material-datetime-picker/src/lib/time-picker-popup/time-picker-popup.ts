import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ConnectedPosition, CdkConnectedOverlay } from '@angular/cdk/overlay';
import { booleanAttribute, ChangeDetectorRef, Component, ElementRef, inject, Input, OnChanges, OnDestroy, output, signal, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { CimaTimePicker } from '../time-picker/time-picker';
import { CimaHourDial, CimaTime, CimaTimeLabels, CimaTimeView, isValidTime } from '../time-picker/time-value';
import { validateTime } from '../time-picker/time-constraints';
import { CimaTimepickerIntl } from '../time-picker/timepicker-intl';
import type { CimaTimePickerInput } from './time-picker-input';

let nextId = 0;

/** Anchored time dialog with an independent draft and optional explicit confirmation. */
@Component({
  selector: 'cima-time-picker-popup',
  exportAs: 'cimaTimePickerPopup',
  imports: [CdkConnectedOverlay, CdkTrapFocus, MatButtonModule, CimaTimePicker],
  template: `
    <ng-template cdkConnectedOverlay [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="isOpen()" [cdkConnectedOverlayHasBackdrop]="true"
      [cdkConnectedOverlayPositions]="positions" [cdkConnectedOverlayPush]="true"
      [cdkConnectedOverlayViewportMargin]="8" cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="close()" (overlayKeydown)="onKeydown($event)" (detach)="close()">
      <div class="panel" [class]="panelClass" [id]="id" role="dialog" aria-modal="true"
        [attr.aria-label]="labels.selectTime || intl.selectTime" cdkTrapFocus>
        <cima-time-picker [(value)]="draftTime" [timeView]="timeView" [hourCycle]="hourCycle"
          [hourDial]="hourDial" [showSeconds]="showSeconds" [allowViewSwitch]="allowViewSwitch" [labels]="labels"
          [hourStep]="hourStep" [minuteStep]="minuteStep" [secondStep]="secondStep"
          [minTime]="control?.minTime ?? null" [maxTime]="control?.maxTime ?? null" [timeFilter]="control?.timeFilter ?? null"
          (selectionComplete)="complete($event)" />
        @if (showActions) {
          <div class="actions">
            <button type="button" matButton (click)="close()">{{ intl.cancel }}</button>
            <button type="button" matButton [disabled]="!canConfirm" (click)="confirm()">{{ intl.confirm }}</button>
          </div>
        }
      </div>
    </ng-template>`,
  styles: `
    :host { display: none; }
    .panel { width: 328px; max-width: calc(100vw - 16px); max-height: calc(100dvh - 16px); overflow-y: auto;
      border-radius: var(--cima-time-panel-radius, 28px); background: var(--mat-sys-surface-container-high, #f7f2fa);
      color: var(--mat-sys-on-surface, #1d1b20); box-shadow: var(--cima-time-panel-shadow, var(--mat-sys-level3, 0 4px 12px #0003)); }
    .actions { display: flex; justify-content: flex-end; gap: 8px; padding: 8px;
      border-top: 1px solid var(--mat-sys-outline-variant, #cac4d0); }
  `,
})
export class CimaTimePickerPopup implements OnChanges, OnDestroy {
  @Input() timeView: CimaTimeView = 'clock';
  @Input() hourCycle: '12' | '24' = '24';
  @Input() hourDial: CimaHourDial = 'single-ring';
  @Input() hourStep = 1;
  @Input() minuteStep = 1;
  @Input() secondStep = 1;
  private readonly localLabels = signal<Partial<CimaTimeLabels>>({});
  /** Shares local label updates with the independently rendered toggle. */
  @Input()
  get labels(): Partial<CimaTimeLabels> { return this.localLabels(); }
  set labels(value: Partial<CimaTimeLabels>) { this.localLabels.set(value); }
  @Input() panelClass: string | string[] = [];
  @Input({ transform: booleanAttribute }) showSeconds = false;
  @Input({ transform: booleanAttribute }) allowViewSwitch = true;
  @Input({ transform: booleanAttribute }) showActions = false;
  private readonly popupDisabled = signal(false);
  /** Shares disabled changes with the toggle even when no dialog is attached. */
  @Input({ transform: booleanAttribute })
  get disabled(): boolean { return this.popupDisabled(); }
  set disabled(value: boolean) { this.popupDisabled.set(value); }
  @Input({ transform: booleanAttribute }) restoreFocus = true;
  readonly opened = output<void>();
  readonly closed = output<void>();
  readonly confirmed = output<CimaTime>();
  readonly cancelled = output<void>();
  readonly isOpen = signal(false);
  readonly draftTime = signal<CimaTime | null>(null);
  readonly intl = inject(CimaTimepickerIntl);
  readonly id = `cima-time-popup-${nextId++}`;
  readonly positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];
  control: CimaTimePickerInput | null = null;
  private readonly element = inject(ElementRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private trigger: HTMLElement | null = null;

  /** Focuses the attached dialog while keeping restoration under the popup's control. */
  @ViewChild(CdkTrapFocus)
  set focusTrap(trap: CdkTrapFocus | undefined) { void trap?.focusTrap.focusInitialElementWhenReady(); }

  /** Refreshes action translations while the dialog is open. */
  constructor() {
    this.intl.changes.pipe(takeUntilDestroyed()).subscribe(() => this.changeDetector.markForCheck());
  }

  /** Keeps display settings synchronized and cancels a disabled popup. */
  ngOnChanges(): void { if (this.disabled) this.close(); this.control?.refresh(); }

  /** Discards any pending draft when the popup is destroyed. */
  ngOnDestroy(): void { this.close(); }

  /** Associates exactly one time input with this popup. */
  registerInput(control: CimaTimePickerInput): void {
    if (this.control && this.control !== control) throw new Error('A CimaTimePickerPopup can only have one input.');
    this.control = control;
  }

  /** Releases an input and cancels its pending session. */
  unregisterInput(control: CimaTimePickerInput): void {
    if (this.control === control) { this.close(); this.control = null; }
  }

  /** Anchors the popup to the public Material form-field origin when available. */
  get origin(): ElementRef { return this.control?.origin ?? this.element; }

  /** Shares the input's daily validation rules with every confirmation path. */
  get canConfirm(): boolean {
    return !!this.control && !this.disabled && !this.control.isDisabled && isValidTime(this.draftTime())
      && !validateTime(this.draftTime(), this.control);
  }

  /** Copies the confirmed value into an independent draft and remembers the focus origin. */
  open(trigger?: HTMLElement): void {
    if (!this.control || this.disabled || this.control.isDisabled || this.isOpen()) return;
    this.trigger = trigger ?? this.control.element.nativeElement;
    this.trigger.focus();
    const value = this.control.value;
    this.draftTime.set(isValidTime(value) ? { ...value } : { hours: 0, minutes: 0, seconds: 0 });
    this.isOpen.set(true);
    this.opened.emit();
  }

  /** Cancels a pending session without applying its draft. */
  close(): void { this.finish(false); }

  /** Ends a session, restoring focus and reporting cancellation only when nothing applied. */
  private finish(applied: boolean): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.draftTime.set(null);
    this.control?.markTouched();
    if (this.restoreFocus && this.trigger?.isConnected) this.trigger.focus();
    this.trigger = null;
    if (!applied) this.cancelled.emit();
    this.closed.emit();
  }

  /** Commits a valid draft and emits a copy, preventing changes to the stored time. */
  confirm(): void {
    const value = this.draftTime();
    if (!this.isOpen() || !this.canConfirm || !isValidTime(value)) return;
    this.control!.commit(value);
    this.finish(true);
    this.confirmed.emit({ ...value });
  }

  /** Preserves automatic final-unit confirmation when actions are hidden. */
  complete(value: CimaTime): void {
    if (!this.showActions && this.isOpen()) { this.draftTime.set({ ...value }); this.confirm(); }
  }

  /** Cancels on Escape without changing the confirmed input value. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); this.close(); }
  }
}
