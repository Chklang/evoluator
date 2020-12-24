import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { EditResearchComponent } from './edit-research.component';

describe('EditResearchComponent', () => {
  let component: EditResearchComponent;
  let bsModalRef: Partial<BsModalRef>;
  let formBuilder: Partial<FormBuilder>;
  let fixture: ComponentFixture<EditResearchComponent>;

  beforeEach(async () => {
    bsModalRef = {};
    formBuilder = {};
    await TestBed.configureTestingModule({
      declarations: [EditResearchComponent],
      providers: [
        { provide: BsModalRef, useValue: bsModalRef },
        { provide: FormBuilder, useValue: formBuilder },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditResearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
