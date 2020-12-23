import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IFeature, IGameContext } from 'game-engine';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { EditBlockersComponent } from '../../edit-blockers/edit-blockers.component';

@Component({
  selector: 'app-edit-feature',
  templateUrl: './edit-feature.component.html',
  styleUrls: ['./edit-feature.component.css']
})
export class EditFeatureComponent implements OnInit {
  public element: IFeature;
  public context: IGameContext;
  public formGroup: FormGroup;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
  ) {
  }

  public ngOnInit(): void {
    if (!this.context) {
      return;
    }
    this.formGroup = this.formBuilder.group({
      name: [this.element.name, Validators.required],
      blockers: EditBlockersComponent.create(this.formBuilder, this.element.blockedBy),
    });
  }

  public save(): void {
    if (this.formGroup.errors) {
      return;
    }
    this.element.name = this.formGroup.controls.name.value;
    this.element.blockedBy = EditBlockersComponent.selected(this.formGroup.controls.blockers as FormGroup);
    this.bsModalRef.hide();
  }

}
