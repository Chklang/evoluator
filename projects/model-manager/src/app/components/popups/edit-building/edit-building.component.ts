import { Component, OnInit } from '@angular/core';
import { IBuilding } from 'game-engine';

@Component({
  selector: 'app-edit-building',
  templateUrl: './edit-building.component.html',
  styleUrls: ['./edit-building.component.css']
})
export class EditBuildingComponent implements OnInit {
  public element: IBuilding;

  constructor() { }

  ngOnInit(): void {
  }

}
