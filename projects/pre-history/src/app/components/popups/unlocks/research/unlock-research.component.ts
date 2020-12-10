import { Component, OnInit } from '@angular/core';
import {Modal} from 'game-engine';
import { researchFeature } from '../../../../database';

@Modal({
  type: 'features.' + researchFeature.name,
  component: UnlockResearchComponent,
})
@Component({
  templateUrl: './unlock-research.component.html',
  styleUrls: ['./unlock-research.component.css']
})
export class UnlockResearchComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
