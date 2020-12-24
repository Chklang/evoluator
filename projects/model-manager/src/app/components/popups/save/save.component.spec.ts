import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { SaveComponent } from './save.component';
import { SerializeGameContextPipe } from './serialize-game-context.pipe';

describe('SaveComponent', () => {
  let component: SaveComponent;
  let bsModalRef: Partial<BsModalRef>;
  let fixture: ComponentFixture<SaveComponent>;

  beforeEach(async () => {
    bsModalRef = {};
    await TestBed.configureTestingModule({
      declarations: [SaveComponent, SerializeGameContextPipe],
      providers: [
        { provide: BsModalRef, useValue: bsModalRef },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
