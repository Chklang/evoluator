import { TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';

import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;

  let modalService: BsModalService;

  beforeEach(() => {
    modalService = {} as any;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: BsModalService,
          useValue: modalService,
        },
      ],
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
