import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LangsService } from '../../services/langs/langs.service';

export interface ITrParams {
  isPlural?: boolean;
  values?: string[];
}
@Directive({
  selector: '[tr]'
})
export class TrDirective implements OnDestroy, OnInit {
  private unsubscribe: Subscription | undefined;
  private trKey = '';
  private trParamsInternal?: ITrParams = { values: [] };
  @Input()
  public get tr(): string {
    return this.trKey;
  }
  public set tr(value: string) {
    this.trKey = value;
    this.updateKey();
  }
  @Input()
  public get trParams(): ITrParams | undefined {
    return this.trParamsInternal;
  }
  public set trParams(value: ITrParams | undefined) {
    this.trParamsInternal = value || {
      values: [],
    };
    if (!this.trParamsInternal.values) {
      this.trParamsInternal.values = [];
    }
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
    this.unsubscribe = this.langsService.translate(this.trKey, this.trParams.values).subscribe(value => {
      this.el.nativeElement.innerText = value;
    });
  }

  public ngOnDestroy(): void {
    this.unsubscribe?.unsubscribe();
  }


}
