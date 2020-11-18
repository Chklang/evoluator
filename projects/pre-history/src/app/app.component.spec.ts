import { TestBed } from '@angular/core/testing';
import { LangsService, StoreService } from 'game-motor';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let storeService: StoreService;
  let langsService: LangsService;
  beforeEach(async () => {
    storeService = {} as any;
    langsService = {} as any;
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
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
