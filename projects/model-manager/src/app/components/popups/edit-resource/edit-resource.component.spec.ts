import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { EditResourceComponent } from './edit-resource.component';

describe('EditResourceComponent', () => {
  let component: EditResourceComponent;
  let bsModalRef: Partial<BsModalRef>;
  let formBuilder: Partial<FormBuilder>;
  let fixture: ComponentFixture<EditResourceComponent>;

  beforeEach(async () => {
    bsModalRef = {};
    formBuilder = {};
    await TestBed.configureTestingModule({
      declarations: [EditResourceComponent],
      providers: [
        { provide: BsModalRef, useValue: bsModalRef },
        { provide: FormBuilder, useValue: formBuilder },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
