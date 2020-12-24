import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectValueFormComponent } from './select-value-form.component';

describe('SelectValueFormComponent', () => {
  let component: SelectValueFormComponent;
  let fixture: ComponentFixture<SelectValueFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectValueFormComponent ]
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
