import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { IResource } from 'game-engine';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, take } from 'rxjs/operators';

@Component({
  selector: 'app-resource-type-form',
  templateUrl: './resource-type-form.component.html',
  styleUrls: ['./resource-type-form.component.css']
})
export class ResourceTypeFormComponent implements OnInit {
  public static create(formBuilder: FormBuilder, init?: Record<string, number>) {
    return formBuilder.group({
      currentAdd: '',
      selected: formBuilder.array(Object.keys(init ||{}).map(key => {
        return formBuilder.group({
          name: key,
          value: init[key],
        });
      })),
    });
  }
  public static selected(formGroup: FormGroup): Record<string, number> {
    const selected = formGroup.controls.selected as FormArray;
    const result: Record<string, number> = {};
    selected.controls.forEach(entry => {
      result[entry.get('name').value] = entry.get('value').value;
    });
    return result;
  }
  
  private allResources$: Subject<IResource[]> = new BehaviorSubject([]);
  @Input()
  public set allResources(value: IResource[]) {
    this.allResources$.next(value);
  }
  @Input()
  public formSrc: FormGroup;

  private resourcesUsed: Subject<AbstractControl[]> = new BehaviorSubject([]);
  private costsUsed: Subject<AbstractControl[]> = new BehaviorSubject([]);
  private currentAdd: Observable<string>;
  public canAdd: Observable<string[]>;

  constructor(
    private readonly formBuilder: FormBuilder,
  ) { }

  public ngOnInit(): void {
    this.currentAdd = this.formSrc.controls.currentAdd.valueChanges;

    this.canAdd = combineLatest([this.currentAdd, this.costsUsed, this.allResources$]).pipe(
      map(([costCurrentAdd, used, allResources]) => {
        const currentLower = costCurrentAdd.toLowerCase();
        const results = allResources
          .map(e => e.name)
          .filter(e => used.findIndex(f => f.get('name').value === e) < 0)
          .filter(e => e.toLowerCase().indexOf(currentLower) >= 0)
          ;
        return results;
      }),
      shareReplay(1),
    );
    this.canAdd.pipe(take(1)).subscribe(); // Hack for typeahead bootstrap4
    this.formSrc.controls.currentAdd.setValue(''); // Hack to send a first value
    this.costsUsed.next((this.formSrc.controls.selected as FormArray).controls);
  }

  public add(): void {
    const resourceName = this.formSrc.controls.currentAdd.value;
    this.allResources$
    .pipe(
      take(1),
      map((allResources) => allResources.find(e => e.name === resourceName)),
      filter(resource => resource !== undefined),
    ).subscribe(resourceSelected => {
      const selectedResources = this.formSrc.controls.selected as FormArray;
      if (selectedResources.controls.some(e => e.get('name').value === resourceSelected.name)) {
        return;
      }
      selectedResources.push(this.formBuilder.group({
        name: resourceSelected.name,
        value: 0,
      }));
      (selectedResources.value as { name: string }[]).sort((a, b) => a.name.localeCompare(b.name))
      selectedResources.patchValue(selectedResources.value);
      this.formSrc.controls.currentAdd.setValue('');
      this.resourcesUsed.next(selectedResources.controls);
    });
  }

  public remove(index: number): void {
    const selectedResources = this.formSrc.controls.selected as FormArray;
    selectedResources.removeAt(index);
    this.resourcesUsed.next(selectedResources.controls);
  }

}

export interface IResultEntry {
  resource: IResource;
  quantity: number;
}
