import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ConfigService, PersistentService } from 'game-engine';
import { of } from 'rxjs';

import { ConfigComponent } from './config.component';

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let fixture: ComponentFixture<ConfigComponent>;
  let formBuilder: FormBuilder;
  let configService: ConfigService;
  let persistentService: PersistentService;

  beforeEach(async () => {
    formBuilder = {
      group: () => ({
        get: () => ({
          setValue: () => {},
        }),
      }),
    } as any;
    configService = {
      config$: of({}),
    } as any;
    persistentService = {} as any;
    await TestBed.configureTestingModule({
      declarations: [ ConfigComponent ],
      providers: [
        {
          provide: FormBuilder,
          useValue: formBuilder,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: PersistentService,
          useValue: persistentService,
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
