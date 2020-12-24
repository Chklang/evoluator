import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IBuilding, IGameContext } from 'game-engine';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ResourceTypeFormComponent } from '../../resource-type-form/resource-type-form.component';

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
      cost: ResourceTypeFormComponent.create(this.formBuilder, this.element.cost),
      produce: ResourceTypeFormComponent.create(this.formBuilder, this.element.produce),
      consume: ResourceTypeFormComponent.create(this.formBuilder, this.element.consume),
      storage: ResourceTypeFormComponent.create(this.formBuilder, this.element.storage),
      maintenance: ResourceTypeFormComponent.create(this.formBuilder, this.element.maintenance),
    });
  }

  public save(): void {
    if (this.formGroup.errors) {
      return;
    }
    this.element.name = this.formGroup.controls.name.value;
    this.element.cost = ResourceTypeFormComponent.selected(this.formGroup.controls.cost as FormGroup);
    this.element.produce = ResourceTypeFormComponent.selected(this.formGroup.controls.produce as FormGroup);
    this.element.consume = ResourceTypeFormComponent.selected(this.formGroup.controls.consume as FormGroup);
    this.element.storage = ResourceTypeFormComponent.selected(this.formGroup.controls.storage as FormGroup);
    this.element.maintenance = ResourceTypeFormComponent.selected(this.formGroup.controls.maintenance as FormGroup);
    this.bsModalRef.hide();
  }

}
