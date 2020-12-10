import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlockResearchComponent } from './unlock-research.component';

describe('UnlockResearchComponent', () => {
  let component: UnlockResearchComponent;
  let fixture: ComponentFixture<UnlockResearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnlockResearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlockResearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
