import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { EditAchievementComponent } from './edit-achievement.component';

describe('EditAchievementComponent', () => {
  let component: EditAchievementComponent;
  let bsModalRef: Partial<BsModalRef>;
  let formBuilder: Partial<FormBuilder>;
  let fixture: ComponentFixture<EditAchievementComponent>;

  beforeEach(async () => {
    bsModalRef = {};
    formBuilder = {};
    await TestBed.configureTestingModule({
      declarations: [EditAchievementComponent],
      providers: [
        { provide: BsModalRef, useValue: bsModalRef },
        { provide: FormBuilder, useValue: formBuilder },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAchievementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
