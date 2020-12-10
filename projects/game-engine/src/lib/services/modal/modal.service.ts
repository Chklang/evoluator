import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Injectable } from '@angular/core';
import { modalesStore } from '../../components/modal/modal-annotation';
import { ModalComponent } from '../../components/modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private bsModalRef: BsModalRef;

  constructor(
    private readonly modalService: BsModalService,
  ) { }

  public openModal(type: string, details?: any): void {
    const modalDescriptor = modalesStore.getElement(type);
    if (!modalDescriptor) {
      return;
    }
    this.bsModalRef = this.modalService.show(ModalComponent as any, {
      animated: true,
      initialState: {
        ...modalDescriptor,
        details,
      },
    });
    this.bsModalRef.content.closeBtnName = 'Close';
  }
}
