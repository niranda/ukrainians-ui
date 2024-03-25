import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { Message } from 'src/app/models/message';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent implements OnInit {
  content?: string = '';
  editingMessage: Message | null = null;

  @Output() contentEmitter = new EventEmitter();

  constructor(public chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.editingMessage$.subscribe((message) => {
      this.editingMessage = message;
      this.content = message?.content; // Заполнить инпут текущим редактируемым сообщением
    });
  }

  sendMessage() {
    if (this.editingMessage) {
      // Выполните действия для редактирования сообщения
      this.chatService.editMessage(this.editingMessage, this.content);
      this.editingMessage = null;
    } else {
      if (this.content?.trim() !== "") {
        this.contentEmitter.emit(this.content);
      }
    }

    this.content = '';
  }
}
