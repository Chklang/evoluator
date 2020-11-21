import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';

import { LangsService } from './langs.service';

describe('LangsService', () => {
  let service: LangsService;
  let http: HttpClient;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    http = {
      get: () => of({}),
    } as any;
    sanitizer = {} as any;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HttpClient,
          useValue: http,
        },
        {
          provide: DomSanitizer,
          useValue: sanitizer,
        },
      ]
    });
    service = TestBed.inject(LangsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
