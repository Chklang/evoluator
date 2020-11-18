import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LangsService } from '../../services/langs/langs.service';

@Directive({
  selector: '[tr]'
})
export class TrDirective implements OnDestroy, OnInit {
  private unsubscribe: Subscription | undefined;
  private trKey = '';
  @Input()
  public get tr(): string {
    return this.trKey;
  }
  public set tr(value: string) {
    this.trKey = value;
    this.updateKey();
  }

  constructor(
    private readonly langsService: LangsService,
    private readonly el: ElementRef,
  ) {
  }

  public ngOnInit(): void {
    this.trKey = this.trKey || this.el.nativeElement.innerText.trim();
    this.updateKey();
  }

  private updateKey(): void {
    if (this.unsubscribe) {
      this.unsubscribe.unsubscribe();
    }
    this.unsubscribe = this.langsService.translate(this.trKey).subscribe(value => {
      this.el.nativeElement.innerText = value;
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe?.unsubscribe();
  }


}
