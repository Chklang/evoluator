import { TestBed } from '@angular/core/testing';

import { GameMotorService } from './game-motor.service';

describe('GameMotorService', () => {
  let service: GameMotorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameMotorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
