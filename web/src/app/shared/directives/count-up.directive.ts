import { Directive, Input, OnInit, OnChanges, SimpleChanges, ElementRef, Renderer2 } from '@angular/core';

@Directive({ selector: '[appCountUp]' })
export class CountUpDirective implements OnInit, OnChanges {
  @Input('appCountUp') targetValue = 0;
  @Input() countDuration = 1200;
  @Input() countPrefix = '';
  @Input() countSuffix = '';

  private currentValue = 0;
  private animationFrame: any;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.animate(this.targetValue);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['targetValue'] && !changes['targetValue'].firstChange) {
      this.animate(changes['targetValue'].currentValue);
    }
  }

  private animate(target: number): void {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    const start = performance.now();
    const from = this.currentValue;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / this.countDuration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      this.currentValue = from + (target - from) * ease;
      this.el.nativeElement.textContent = this.countPrefix + this.formatNumber(this.currentValue) + this.countSuffix;

      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(step);
      }
    };

    this.animationFrame = requestAnimationFrame(step);
  }

  private formatNumber(value: number): string {
    if (Math.abs(value) >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (Math.abs(value) >= 1000) {
      return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
