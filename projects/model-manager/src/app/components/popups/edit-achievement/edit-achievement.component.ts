import { Component, OnInit } from '@angular/core';
import { IAchievement } from 'game-engine';

@Component({
  selector: 'app-edit-achievement',
  templateUrl: './edit-achievement.component.html',
  styleUrls: ['./edit-achievement.component.css']
})
export class EditAchievementComponent implements OnInit {
  public element: IAchievement;

  constructor() { }

  ngOnInit(): void {
  }

}
