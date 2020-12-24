import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IResearch, IGameContext } from 'game-engine';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ResourceTypeFormComponent } from '../../resource-type-form/resource-type-form.component';

@Component({
  selector: 'app-edit-research',
  templateUrl: './edit-research.component.html',
  styleUrls: ['./edit-research.component.css']
})
export class EditResearchComponent implements OnInit {
  public element: IResearch;
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
      levelMax: [this.element.maxLevel, Validators.required],
      cost: ResourceTypeFormComponent.create(this.formBuilder, this.element.cost),
      bonusResources: ResourceTypeFormComponent.create(this.formBuilder, this.element.bonusResources),
      bonusBuildingCosts: ResourceTypeFormComponent.create(this.formBuilder, this.element.bonusBuildingCosts),
    });
  }

  public save(): void {
    if (this.formGroup.errors) {
      return;
    }
    this.element.name = this.formGroup.controls.name.value;
    this.element.maxLevel = this.formGroup.controls.levelMax.value || undefined;
    this.element.cost = ResourceTypeFormComponent.selected(this.formGroup.controls.cost as FormGroup);
    this.element.bonusResources = ResourceTypeFormComponent.selected(this.formGroup.controls.bonusResources as FormGroup);
    this.element.bonusBuildingCosts = ResourceTypeFormComponent.selected(this.formGroup.controls.bonusBuildingCosts as FormGroup);
    this.bsModalRef.hide();
  }

}
