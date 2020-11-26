import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResearchsService, StoreService } from 'game-engine';
import { BackgroundActionsService } from '../../services/background-actions/background-actions.service';

import { ResearchsComponent } from './researchs.component';

describe('ResearchsComponent', () => {
  let component: ResearchsComponent;
  let fixture: ComponentFixture<ResearchsComponent>;
  let storeService: StoreService;
  let researchsService: ResearchsService;
  let backgroundActionsService: BackgroundActionsService;

  beforeEach(async () => {
    storeService = {} as any;
    researchsService = {} as any;
    backgroundActionsService = {} as any;
    await TestBed.configureTestingModule({
      declarations: [ ResearchsComponent ],
      providers: [
        {
          provide: StoreService,
          useValue: storeService,
        },
        {
          provide: ResearchsService,
          useValue: researchsService,
        },
        {
          provide: BackgroundActionsService,
          useValue: backgroundActionsService,
        },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
