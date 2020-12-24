import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IAchievement } from 'game-engine';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-edit-achievement',
  templateUrl: './edit-achievement.component.html',
  styleUrls: ['./edit-achievement.component.css']
})
export class EditAchievementComponent implements OnInit {
  public element: IAchievement;
  public formGroup: FormGroup;

  constructor(
    public bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
  ) {
  }

  public ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      name: [this.element.name, Validators.required],
    });
  }

  public save(): void {
    if (this.formGroup.errors) {
      return;
    }
    this.element.name = this.formGroup.controls.name.value;
    this.bsModalRef.hide();
  }

}
