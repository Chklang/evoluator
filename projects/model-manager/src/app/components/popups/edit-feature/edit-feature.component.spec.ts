import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { EditFeatureComponent } from './edit-feature.component';

describe('EditFeatureComponent', () => {
  let component: EditFeatureComponent;
  let bsModalRef: Partial<BsModalRef>;
  let formBuilder: Partial<FormBuilder>;
  let fixture: ComponentFixture<EditFeatureComponent>;

  beforeEach(async () => {
    bsModalRef = {};
    formBuilder = {};
    await TestBed.configureTestingModule({
      declarations: [EditFeatureComponent],
      providers: [
        { provide: BsModalRef, useValue: bsModalRef },
        { provide: FormBuilder, useValue: formBuilder },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
