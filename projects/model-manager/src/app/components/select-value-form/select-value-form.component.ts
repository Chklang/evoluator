import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, shareReplay, take } from 'rxjs/operators';

@Component({
  selector: 'app-select-value-form',
  templateUrl: './select-value-form.component.html',
  styleUrls: ['./select-value-form.component.css']
})
export class SelectValueFormComponent implements OnInit {
  public static create(formBuilder: FormBuilder, init?: Record<string, number>) {
    return formBuilder.group({
      currentAdd: '',
      selected: formBuilder.array(Object.keys(init || {}).map(key => {
        return formBuilder.group({
          name: key,
          value: init[key],
        });
      })),
    });
  }
  public static createFromArray(formBuilder: FormBuilder, init?: { key: string, value: number }[]) {
    return formBuilder.group({
      currentAdd: '',
      selected: formBuilder.array((init || []).map(entry => {
        return formBuilder.group({
          name: entry.key,
          value: entry.value,
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

  private allValues$: Subject<string[]> = new BehaviorSubject([]);
  @Input()
  public set allValues(value: string[]) {
    this.allValues$.next(value);
  }
  @Input()
  public formSrc: FormGroup;

  @Input()
  public withValue = true;

  private valuesUsed: Subject<AbstractControl[]> = new BehaviorSubject([]);
  private costsUsed: Subject<AbstractControl[]> = new BehaviorSubject([]);
  private currentAdd: Observable<string>;
  public canAdd: Observable<string[]>;

  constructor(
    private readonly formBuilder: FormBuilder,
  ) { }

  public ngOnInit(): void {
    this.currentAdd = this.formSrc.controls.currentAdd.valueChanges;

    this.canAdd = combineLatest([this.currentAdd, this.costsUsed, this.allValues$]).pipe(
      map(([costCurrentAdd, used, allValues]) => {
        const currentLower = costCurrentAdd.toLowerCase();
        const results = allValues
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
    this.allValues$
      .pipe(
        take(1),
        map((allValues) => allValues.find(e => e === resourceName)),
        filter(resource => resource !== undefined),
      ).subscribe(valueSelected => {
        const selectedValue = this.formSrc.controls.selected as FormArray;
        if (selectedValue.controls.some(e => e.get('name').value === valueSelected)) {
          return;
        }
        selectedValue.push(this.formBuilder.group({
          name: valueSelected,
          value: 0,
        }));
        (selectedValue.value as { name: string }[]).sort((a, b) => a.name.localeCompare(b.name))
        selectedValue.patchValue(selectedValue.value);
        this.formSrc.controls.currentAdd.setValue('');
        this.valuesUsed.next(selectedValue.controls);
      });
  }

  public remove(index: number): void {
    const selectedValues = this.formSrc.controls.selected as FormArray;
    selectedValues.removeAt(index);
    this.valuesUsed.next(selectedValues.controls);
  }

}
