import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ResourcesNamePipe } from '../../../pipes/resources-name.pipe';

import { EditBuildingComponent } from './edit-building.component';

describe('EditBuildingComponent', () => {
  let component: EditBuildingComponent;
  let bsModalRef: Partial<BsModalRef>;
  let formBuilder: Partial<FormBuilder>;
  let fixture: ComponentFixture<EditBuildingComponent>;

  beforeEach(async () => {
    bsModalRef = {};
    formBuilder = {};
    await TestBed.configureTestingModule({
      declarations: [EditBuildingComponent, ResourcesNamePipe],
      providers: [
        { provide: BsModalRef, useValue: bsModalRef },
        { provide: FormBuilder, useValue: formBuilder },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
