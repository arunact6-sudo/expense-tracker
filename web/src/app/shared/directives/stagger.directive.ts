import { Directive, Input, OnInit, ElementRef, Renderer2 } from '@angular/core';

@Directive({ selector: '[appStagger]' })
export class StaggerDirective implements OnInit {
  @Input('appStagger') animationType = 'fadeInUp';
  @Input() staggerDelay = 60;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const children = this.el.nativeElement.children;
    const animations: Record<string, string> = {
      fadeInUp: 'fadeInUp 0.5s ease forwards',
      fadeIn: 'fadeIn 0.4s ease forwards',
      slideInRight: 'slideInRight 0.5s ease forwards',
      slideInLeft: 'slideInLeft 0.5s ease forwards',
      scaleIn: 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      bounceIn: 'bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
    };

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      this.renderer.setStyle(child, 'opacity', '0');
      this.renderer.setStyle(child, 'animation', animations[this.animationType] || animations['fadeInUp']);
      this.renderer.setStyle(child, 'animation-delay', `${i * this.staggerDelay}ms`);
    }
  }
}
