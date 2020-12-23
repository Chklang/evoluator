import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { BuildingsNamePipe } from '../../pipes/buildings-name.pipe';
import { ResourcesNamePipe } from '../../pipes/resources-name.pipe';

import { SelectValueFormComponent } from './select-value-form.component';

describe('SelectValueFormComponent', () => {
  let component: SelectValueFormComponent;
  let formBuilder: Partial<FormBuilder>;
  let fixture: ComponentFixture<SelectValueFormComponent>;

  beforeEach(async () => {
    formBuilder = {};
    await TestBed.configureTestingModule({
      declarations: [SelectValueFormComponent, ResourcesNamePipe, BuildingsNamePipe],
      providers: [
        { provide: FormBuilder, useValue: formBuilder },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectValueFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
