import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from 'game-engine';
import { of } from 'rxjs';
import { BackgroundActionsService } from '../../services/background-actions/background-actions.service';

import { ColonyComponent } from './colony.component';

describe('ColonyComponent', () => {
  let component: ColonyComponent;
  let storeService: StoreService;
  let activatedRoute: ActivatedRoute;
  let backgroundAction: BackgroundActionsService;
  let fixture: ComponentFixture<ColonyComponent>;

  beforeEach(async () => {
    activatedRoute = {
      paramMap: of(new Map()),
    } as any;
    storeService = {} as any;
    backgroundAction = {} as any;
    await TestBed.configureTestingModule({
      declarations: [ColonyComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: StoreService,
          useValue: storeService,
        },
        {
          provide: BackgroundActionsService,
          useValue: backgroundAction,
        },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColonyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
