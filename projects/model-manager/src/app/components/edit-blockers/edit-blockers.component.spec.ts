import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBlockersComponent } from './edit-blockers.component';

describe('EditBlockersComponent', () => {
  let component: EditBlockersComponent;
  let fixture: ComponentFixture<EditBlockersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBlockersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBlockersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
