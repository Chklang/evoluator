import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceTypeFormComponent } from './resource-type-form.component';

describe('ResourceTypeFormComponent', () => {
  let component: ResourceTypeFormComponent;
  let fixture: ComponentFixture<ResourceTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResourceTypeFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
