import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-private-chat',
  templateUrl: './private-chat.component.html',
  styleUrls: ['./private-chat.component.css']
})
export class PrivateChatComponent implements OnDestroy, OnInit {
  @Input() toUser: string = '';

  constructor(public chatService: ChatService) { }
  
  ngOnInit(): void {}

  ngOnDestroy(): void {}

  sendMessage(content: string) {
    this.chatService.sendPrivateMessage(this.toUser, content);
  }
}
