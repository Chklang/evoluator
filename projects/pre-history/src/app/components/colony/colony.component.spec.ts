import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StoreService } from 'game-motor';

import { ColonyComponent } from './colony.component';

describe('ColonyComponent', () => {
  let component: ColonyComponent;
  let storeService: StoreService;
  let fixture: ComponentFixture<ColonyComponent>;

  beforeEach(async () => {
    storeService = {} as any;
    await TestBed.configureTestingModule({
      declarations: [ColonyComponent],
      providers: [
        {
          provide: StoreService,
          useValue: storeService,
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
