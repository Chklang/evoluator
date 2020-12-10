import { Component, ComponentFactoryResolver, Directive, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Directive({
  selector: '[modalContent]',
})
export class ModalContentDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}


@Component({
  selector: 'lib-achievement-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit {
  public type: string;
  public component: Type<any>;
  public details: any;

  @ViewChild(ModalContentDirective, { static: true })
  public content: ModalContentDirective;

  constructor(
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly bsModalRef: BsModalRef,
  ) { }

  public ngOnInit(): void {
    this.loadComponent();
  }

  public close(): void {
    this.bsModalRef.hide();
  }

  public loadComponent(): void {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.component);

    const viewContainerRef = this.content.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent<any>(componentFactory);
    componentRef.instance.details = this.details;
  }

}
