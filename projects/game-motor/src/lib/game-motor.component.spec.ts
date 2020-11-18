import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameMotorComponent } from './game-motor.component';

describe('GameMotorComponent', () => {
  let component: GameMotorComponent;
  let fixture: ComponentFixture<GameMotorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameMotorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameMotorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
