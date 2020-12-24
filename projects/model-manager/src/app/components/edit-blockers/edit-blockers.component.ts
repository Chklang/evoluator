import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IBlocker, IBuildingBlocker, IFeatureBlocker, IResourceBlocker, IGameContext } from 'game-engine';
import { SelectValueFormComponent } from '../select-value-form/select-value-form.component';

@Component({
  selector: 'app-edit-blockers',
  templateUrl: './edit-blockers.component.html',
  styleUrls: ['./edit-blockers.component.css']
})
export class EditBlockersComponent implements OnInit {
  public static create(formBuilder: FormBuilder, blockers?: IBlocker<any>[]) {

    const result = formBuilder.group({
      buildings: SelectValueFormComponent.createFromArray(formBuilder, (blockers || [])
        .filter(blocker => blocker.type === 'building')
        .map(blocker => {
          const typedBlocker = blocker as IBuildingBlocker;
          return {
            key: typedBlocker.params.name,
            value: typedBlocker.params.quantity,
          };
        })),
      features: SelectValueFormComponent.createFromArray(formBuilder, (blockers || [])
        .filter(blocker => blocker.type === 'feature')
        .map(blocker => {
          const typedBlocker = blocker as IFeatureBlocker;
          return {
            key: typedBlocker.params.name,
            value: 0,
          };
        })),
      resources: SelectValueFormComponent.createFromArray(formBuilder, (blockers || [])
        .filter(blocker => blocker.type === 'resource')
        .map(blocker => {
          const typedBlocker = blocker as IResourceBlocker;
          return {
            key: typedBlocker.params.name,
            value: typedBlocker.params.quantity,
          };
        })),
      resourcesTotal: SelectValueFormComponent.createFromArray(formBuilder, (blockers || [])
        .filter(blocker => blocker.type === 'resourceTotal')
        .map(blocker => {
          const typedBlocker = blocker as IResourceBlocker;
          return {
            key: typedBlocker.params.name,
            value: typedBlocker.params.quantity,
          };
        })),
    });
    return result;
  }
  public static selected(formGroup: FormGroup): IBlocker<any>[] {
    const buildings = SelectValueFormComponent.selected(formGroup.controls.buildings as FormGroup);
    const features = SelectValueFormComponent.selected(formGroup.controls.features as FormGroup);
    const resources = SelectValueFormComponent.selected(formGroup.controls.resources as FormGroup);
    const resourcesTotal = SelectValueFormComponent.selected(formGroup.controls.resourcesTotal as FormGroup);
    return [
      ...Object.keys(buildings).map((key): IBuildingBlocker => {
        return {
          type: 'building',
          params: {
            name: key,
            quantity: buildings[key],
          }
        }
      }),
      ...Object.keys(features).map((key): IFeatureBlocker => {
        return {
          type: 'feature',
          params: {
            name: key,
          }
        }
      }),
      ...Object.keys(resources).map((key): IResourceBlocker => {
        return {
          type: 'resource',
          params: {
            name: key,
            quantity: resources[key],
          }
        }
      }),
      ...Object.keys(resourcesTotal).map((key): IResourceBlocker => {
        return {
          type: 'resourceTotal',
          params: {
            name: key,
            quantity: resourcesTotal[key],
          }
        }
      }),
    ];
  }

  @Input()
  public formSrc: FormGroup;

  @Input()
  public context: IGameContext;

  constructor() { }

  public ngOnInit(): void {
    console.log("Blockers", this);
  }

}