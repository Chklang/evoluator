import { Component, OnInit } from '@angular/core';
import { StoreService } from 'game-motor';
import { buildings, gameFromScratch, resources } from '../../database';

@Component({
  selector: 'app-colony',
  templateUrl: './colony.component.html',
  styleUrls: ['./colony.component.css']
})
export class ColonyComponent implements OnInit {

  constructor(
    public storeService: StoreService,
  ) { }

  public ngOnInit(): void {
  }


}
