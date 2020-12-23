import { Component, OnInit } from '@angular/core';
import { IFeature } from 'game-engine';

@Component({
  selector: 'app-edit-feature',
  templateUrl: './edit-feature.component.html',
  styleUrls: ['./edit-feature.component.css']
})
export class EditFeatureComponent implements OnInit {
  public element: IFeature;

  constructor() { }

  ngOnInit(): void {
  }

}
