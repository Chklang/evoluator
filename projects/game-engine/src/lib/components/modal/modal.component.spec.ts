import { ComponentFactoryResolver } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  let componentFactoryResolver: ComponentFactoryResolver;
  let bsModalRef: BsModalRef;

  beforeEach(async () => {
    componentFactoryResolver = {
      resolveComponentFactory: () => {},
    } as any;
    bsModalRef = {} as any;
    await TestBed.configureTestingModule({
      declarations: [ModalComponent],
      providers: [
        {
          provide: ComponentFactoryResolver,
          useValue: componentFactoryResolver,
        },
        {
          provide: BsModalRef,
          useValue: bsModalRef,
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    component.content = {
      viewContainerRef: {
        clear: () => {},
        createComponent: () => ({
          instance: {},
        }),
      } as any,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
