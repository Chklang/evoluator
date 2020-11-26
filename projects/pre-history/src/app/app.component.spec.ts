import { TestBed } from '@angular/core/testing';
import { FeaturesService, LangsService, StoreService } from 'game-engine';
import { AppComponent } from './app.component';
import { BackgroundActionsService } from './services/background-actions/background-actions.service';

describe('AppComponent', () => {
  let storeService: StoreService;
  let langsService: LangsService;
  let backgroundAction: BackgroundActionsService;
  let featureService: FeaturesService;
  beforeEach(async () => {
    storeService = {} as any;
    langsService = {} as any;
    backgroundAction = {} as any;
    featureService = {} as any;
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        {
          provide: StoreService,
          useValue: storeService,
        },
        {
          provide: LangsService,
          useValue: langsService,
        },
        {
          provide: BackgroundActionsService,
          useValue: backgroundAction,
        },
        {
          provide: FeaturesService,
          useValue: featuresService,
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
