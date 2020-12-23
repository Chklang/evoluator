import { Component, OnInit } from '@angular/core';
import { IResearch } from 'game-engine';

@Component({
  selector: 'app-edit-research',
  templateUrl: './edit-research.component.html',
  styleUrls: ['./edit-research.component.css']
})
export class EditResearchComponent implements OnInit {
  public element: IResearch;

  constructor() { }

  ngOnInit(): void {
  }

}
