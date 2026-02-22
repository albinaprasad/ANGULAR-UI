import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: false
})
export class InfiniteScrollDirective {
  @Input() thresholdPx = 200;
  @Input() throttleMs = 150;
  @Input() disabled = false;

  @Output() reachedBottom = new EventEmitter<void>();

  private lastEmit = 0;

  constructor(private host: ElementRef<HTMLElement>) {}

  @HostListener('scroll')
  onScroll(): void {
    if (this.disabled) return;

    const el = this.host.nativeElement;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (remaining > this.thresholdPx) return;

    const now = Date.now();
    if (now - this.lastEmit < this.throttleMs) return;

    this.lastEmit = now;
    this.reachedBottom.emit();
  }
}
