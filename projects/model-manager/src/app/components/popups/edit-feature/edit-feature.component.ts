import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IFeature } from 'game-engine';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-edit-feature',
  templateUrl: './edit-feature.component.html',
  styleUrls: ['./edit-feature.component.css']
})
export class EditFeatureComponent implements OnInit {
  public element: IFeature;
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
