import { Component, OnInit } from '@angular/core';
import { IGameContext } from 'game-engine';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-save',
  templateUrl: './save.component.html',
  styleUrls: ['./save.component.css']
})
export class SaveComponent implements OnInit {
  public datas: IGameContext;

  constructor(
    public bsModalRef: BsModalRef,
  ) { }

  ngOnInit(): void {
  }

}
