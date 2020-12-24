import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { IAchievement, IGameContext } from 'game-engine';
import { EditBlockersComponent } from '../../edit-blockers/edit-blockers.component';

@Component({
  selector: 'app-edit-achievement',
  templateUrl: './edit-achievement.component.html',
  styleUrls: ['./edit-achievement.component.css']
})
export class EditAchievementComponent implements OnInit {
  public element: IAchievement;
  public context: IGameContext;
  public formGroup: FormGroup;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
  ) {
  }

  public ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      name: [this.element.name, Validators.required],
      levels: this.formBuilder.array(this.element.levels.map(level => {
        return this.formBuilder.group({
          levelNumber: level.level,
          goals: EditBlockersComponent.create(this.formBuilder, level.blockers),
        });
      })),
    });
  }

  public addLevel(): void {
    const levels = this.formGroup.get('levels') as FormArray;
    levels.push(this.formBuilder.group({
      levelNumber: levels.length,
      goals: EditBlockersComponent.create(this.formBuilder),
    }));
  }

  public remove(index: number): void {
    const levels = this.formGroup.get('levels') as FormArray;
    if (levels.length < index) {
      return;
    }
    for (let i = index + 1; i < levels.length; i++) {
      const previousValue = levels.at(i - 1).value;
      const nextValue = levels.at(i).value;
      previousValue.goals = nextValue.goals;
      levels.at(i - 1).patchValue(previousValue);
    }
    levels.removeAt(levels.length - 1);
  }

  public save(): void {
    if (this.formGroup.errors) {
      return;
    }
    this.element.name = this.formGroup.controls.name.value;
    const levels = this.formGroup.get('levels') as FormArray;
    this.element.levels = levels.controls.map(level => {
      return {
        level: level.value.levelNumber,
        blockers: EditBlockersComponent.selected(level.get('goals') as FormGroup),
      };
    });
    this.bsModalRef.hide();
  }

}
