import { Component, OnInit } from '@angular/core';
import { AchievementsService } from 'game-engine';

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.css']
})
export class AchievementsComponent implements OnInit {

  constructor(
    public achievementsService: AchievementsService,
  ) { }

  ngOnInit(): void {
  }

}
