import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(-2px)');
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', '0 8px 24px rgba(92, 107, 192, 0.12)');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(0)');
    this.renderer.setStyle(this.el.nativeElement, 'boxShadow', 'none');
  }
}
