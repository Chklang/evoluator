import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagersLibComponent } from './managers-lib.component';

describe('ManagersLibComponent', () => {
  let component: ManagersLibComponent;
  let fixture: ComponentFixture<ManagersLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManagersLibComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagersLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
