import { Component, OnInit } from '@angular/core';
import { MessagesService } from '../../services';

@Component({
  selector: 'lib-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  constructor(
    public readonly messagesService: MessagesService,
  ) { }

  ngOnInit(): void {
  }

}
