import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IResource, IGameContext } from 'game-engine';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { EditBlockersComponent } from '../../edit-blockers/edit-blockers.component';

@Component({
  selector: 'app-edit-resource',
  templateUrl: './edit-resource.component.html',
  styleUrls: ['./edit-resource.component.css']
})
export class EditResourceComponent implements OnInit {
  public element: IResource;
  public context: IGameContext;
  public formGroup: FormGroup;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
  ) { }

  public ngOnInit(): void {
    if (!this.context) {
      return;
    }
    this.formGroup = this.formBuilder.group({
      name: [this.element.name, Validators.required],
      resourceType: [this.element.resourceType, Validators.required],
      icon: [this.element.icon, Validators.required],
      min: [this.element.min],
      max: [this.element.max, Validators.required],
      growType: [this.element.growType, Validators.required],
      selfGrow: [this.element.selfGrow],
      blockers: EditBlockersComponent.create(this.formBuilder, this.element.blockedBy),
    });
  }

  public save(): void {
    if (this.formGroup.errors) {
      return;
    }
    this.element.name = this.formGroup.controls.name.value;
    this.element.resourceType = this.formGroup.controls.resourceType.value;
    this.element.icon = this.formGroup.controls.icon.value;
    this.element.min = this.formGroup.controls.min.value || undefined;
    this.element.max = this.formGroup.controls.max.value;
    this.element.growType = this.formGroup.controls.growType.value;
    this.element.selfGrow = this.formGroup.controls.selfGrow.value || undefined;
    this.element.blockedBy = EditBlockersComponent.selected(this.formGroup.controls.blockers as FormGroup);
    this.bsModalRef.hide();
  }
}
