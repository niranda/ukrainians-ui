import { Component, Input } from '@angular/core';
import { Message } from 'src/app/models/message';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent {
  @Input() messages: Message[] = [];

  constructor(public chatService: ChatService) { }

  editMessage(message: Message) {
    this.chatService.setEditingMessage(message);
  }

  deleteMessage(message: Message) {
    this.chatService.deleteMessage(message);
  }

  getUserImage(message: Message) {
    if (message.from == null || message.to == null) return;

    if (message.from == this.chatService.myName) {
      return this.chatService.myProfilePicture;
    }

    const index = this.chatService.privateChats.findIndex(s => s.user.name == message.from);
    return this.chatService.getImageFromBytes(this.chatService.privateChats[index].user.profilePicture)
  }

  hoverMessage(message: Message) {
    message.hovered = !message.hovered;
  }
}
