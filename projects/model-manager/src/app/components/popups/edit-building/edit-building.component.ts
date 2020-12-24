import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IBuilding, IGameContext } from 'game-engine';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SelectValueFormComponent } from '../../select-value-form/select-value-form.component';

@Component({
  selector: 'app-edit-building',
  templateUrl: './edit-building.component.html',
  styleUrls: ['./edit-building.component.css']
})
export class EditBuildingComponent implements OnInit {
  public element: IBuilding;
  public context: IGameContext;
  public formGroup: FormGroup;
  public resources: string[];

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
  ) {
  }

  public ngOnInit(): void {
    this.resources = this.context.allResources.map(e => e.name);
    this.formGroup = this.formBuilder.group({
      name: [this.element.name, Validators.required],
      cost: SelectValueFormComponent.create(this.formBuilder, this.element.cost),
      produce: SelectValueFormComponent.create(this.formBuilder, this.element.produce),
      consume: SelectValueFormComponent.create(this.formBuilder, this.element.consume),
      storage: SelectValueFormComponent.create(this.formBuilder, this.element.storage),
      maintenance: SelectValueFormComponent.create(this.formBuilder, this.element.maintenance),
    });
  }

  public save(): void {
    if (this.formGroup.errors) {
      return;
    }
    this.element.name = this.formGroup.controls.name.value;
    this.element.cost = SelectValueFormComponent.selected(this.formGroup.controls.cost as FormGroup);
    this.element.produce = SelectValueFormComponent.selected(this.formGroup.controls.produce as FormGroup);
    this.element.consume = SelectValueFormComponent.selected(this.formGroup.controls.consume as FormGroup);
    this.element.storage = SelectValueFormComponent.selected(this.formGroup.controls.storage as FormGroup);
    this.element.maintenance = SelectValueFormComponent.selected(this.formGroup.controls.maintenance as FormGroup);
    this.bsModalRef.hide();
  }

}
