import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AchievementsService } from 'game-engine';

import { AchievementsComponent } from './achievements.component';

describe('AchievementsComponent', () => {
  let component: AchievementsComponent;
  let achievementsService: AchievementsService;
  let fixture: ComponentFixture<AchievementsComponent>;

  beforeEach(async () => {
    achievementsService = {} as any;
    await TestBed.configureTestingModule({
      declarations: [ AchievementsComponent ],
      providers: [
        {
          provider: AchievementsService,
          useValue: achievementsService,
        },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AchievementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
