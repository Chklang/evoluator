import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';

import { SchemaComponent } from './schema.component';

describe('SchemaComponent', () => {
  let component: SchemaComponent;
  let modalService: Partial<BsModalService>;
  let fixture: ComponentFixture<SchemaComponent>;

  beforeEach(async () => {
    modalService = {};
    await TestBed.configureTestingModule({
      declarations: [ SchemaComponent ],
      providers: [
        { provide: BsModalService, useValue: modalService },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
