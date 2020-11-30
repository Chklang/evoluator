import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockerStatusComponent } from './blocker-status.component';

describe('BlockerStatusComponent', () => {
  let component: BlockerStatusComponent;
  let fixture: ComponentFixture<BlockerStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockerStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockerStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
