import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuildingsService, FavoritesService } from 'game-engine';
import { of } from 'rxjs';
import { BackgroundActionsService } from '../../services/background-actions/background-actions.service';

import { FavoritesComponent } from './favorites.component';

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let backgroundAction: BackgroundActionsService;
  let buildingsService: BuildingsService;
  let favoritesService: FavoritesService;
  let fixture: ComponentFixture<FavoritesComponent>;

  beforeEach(async () => {
    backgroundAction = {} as any;
    buildingsService = {} as any;
    favoritesService = {
      favorites$: of(),
    } as any;
    await TestBed.configureTestingModule({
      declarations: [ FavoritesComponent ],
      providers: [
        {
          provide: BackgroundActionsService,
          useValue: backgroundAction,
        },
        {
          provide: BuildingsService,
          useValue: buildingsService,
        },
        {
          provide: FavoritesService,
          useValue: favoritesService,
        },
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
