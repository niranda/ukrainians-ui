import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { PrivateChatComponent } from '../containers/private-chat/private-chat.component';
import { Chat } from '../models/chat';
import { Message } from '../models/message';
import { User } from '../models/user';
import { Notification } from '../models/notification';
import { PushSubscription } from '../models/pushSubscription';
import { FileUpload } from '../models/fileUpload';
import { DomSanitizer } from '@angular/platform-browser';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  myName: string = '';
  myEmail: string = '';
  myProfilePicture: any;
  otherUser: string = '';
  roomId: string = '';
  private chatConnection?: HubConnection;
  onlineUsers: User[] = [];
  privateChats: Chat[] = [];
  messages: Message[] = [];
  privateMessages: Message[] = [];
  privateMessageInitiated = false;

  messageToEdit: Message;
  private editingMessageSource = new BehaviorSubject<Message | null>(null);
  editingMessage$ = this.editingMessageSource.asObservable();

  constructor(private httpClient: HttpClient, private modalService: NgbModal, private sanitizer: DomSanitizer) { }

  registerUser(user: User) {
    return this.httpClient.post(`${environment.apiUrl}chat/register-user`, user, {responseType:'text'})
  }

  createChatConnection() {
    this.chatConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}hubs/chat`).withAutomaticReconnect().build();

    this.chatConnection?.start().catch(error => {
      console.log(error);
    });

    this.chatConnection.on('UserConnected', () => {
      this.addUserConnectionId();
    });

    this.chatConnection.on('OnlineUsers', (onlineUsers: User[]) => {
      this.onlineUsers = [...onlineUsers];
    });

    this.chatConnection.on('PrivateChats', (lastMessages: Chat[]) => {
      this.privateChats = [...lastMessages];
    });

    this.chatConnection.on('NewMessage', (newMessage: Message) => {
      this.messages = [...this.messages, newMessage];
    });

    this.chatConnection.on('InitializeMainRoom', (roomId, messages: Message[]) => {
      this.roomId = roomId;
      this.messages = [...messages];
    });

    this.chatConnection.on('Notify', (notifications: Notification[]) => {
      this.applyNotifications(notifications);
    });

    this.chatConnection.on('OpenPrivateChat', (messages: Message[], notifications: Notification[], from: string, to: string) => {
      this.applyNotifications(notifications);
      
      if (from == this.myName && to == this.otherUser) {
        this.privateMessages = [...messages];
        this.privateMessageInitiated = true;
        const index = this.privateChats.findIndex(s => s.user.name ==  to);
        this.privateChats[index].unread = 0;
      }
    });

    this.chatConnection.on('NewPrivateMessage', (newMessage: Message, notifications?: Notification[]) => {
      this.applyNotifications(notifications);

      if (newMessage.from == this.otherUser || newMessage.to == this.otherUser) {
        this.privateMessages = [...this.privateMessages, newMessage];
      }

      const index = this.privateChats.findIndex(s => s.user.name == newMessage.from || s.user.name == newMessage.to);
      this.privateChats[index].chatMessage = newMessage.content;
    });

    this.chatConnection.on('MessagesRead', () => {
      this.privateMessages.forEach(m => m.unread = false);
    });
    
    this.chatConnection.on('UpdateMessage', (message: Message) => {
      let index = this.privateMessages.findIndex(mes => mes.id === message.id);
      if (index !== -1) {
        this.privateMessages[index] = message;
      } else {
        index = this.messages.findIndex(mes => mes.id === message.id);
        this.messages[index] = message;
      }
    });

    this.chatConnection.on('DeleteMessage', (message: Message) => {
      let index = this.privateMessages.findIndex(mes => mes.id === message.id);
      if (index !== -1) {
        this.privateMessages.splice(index, 1);
      } else {
        index = this.messages.findIndex(mes => mes.id === message.id);
        this.messages.splice(index, 1);
      }
    });

    this.chatConnection.on('ClosePrivateChat', (from: string, to: string) => {
      if (from == this.myName && to == this.otherUser) {
        this.privateMessageInitiated = false;
        this.privateMessages = [];
      }
      // this.modalService.dismissAll();
    });
  }

  stopChatConnection() {
    this.chatConnection?.stop().catch(error => {
      console.log(error);
    });
  }

  async addUserConnectionId() {
    return this.chatConnection?.invoke('AddUserConnectionId', this.myName)
      .catch(error => {
        console.log(error);
      });
  }

  async sendMessage(content: string) {
    const message: Message = {
      from: this.myName,
      content: content,
      chatRoomId: this.roomId,
      created: new Date(),
      unread: true
    };

    return this.chatConnection?.invoke('ReceiveMessage', message)
      .catch(error => {
        console.log(error);
      });
  }

  async sendPrivateMessage(to: string, content: string) {
    const message: Message = {
      to: to,
      from: this.myName,
      content: content,
      created: new Date(),
      unread: true
    };

    return this.chatConnection?.invoke('ReceivePrivateMessage', message)
    .catch(error => {
      console.log(error);
    });
  }

  async openPrivateChat(otherUser: string) {
    if (!this.privateMessageInitiated) {
      this.privateMessageInitiated = true;
    }

    this.otherUser = otherUser;

    return this.chatConnection?.invoke('OpenPrivateChat', this.myName, this.otherUser )
        .catch(error => {
          console.log(error);
        });
  }

  async closePrivateChatMessage(otherUser: string) {
    this.otherUser = '';

    return this.chatConnection?.invoke('RemovePrivateChat', this.myName, otherUser)
      .catch(error => {
        console.log(error);
      });
  }

  async subscribeForNotifications(subscription: PushSubscription) {
    return this.chatConnection?.invoke('SubscribeForNotifications', subscription, this.myName)
    .catch(error => {
      console.log(error);
    });
  }

  async unsubscribeFromNotifications(subscription: PushSubscription) {
    return this.chatConnection?.invoke('UnsubscribeFromNotifications', subscription, this.myName)
    .catch(error => {
      console.log(error);
    });
  }

  async broadcast(subscription: PushSubscription) {
    return this.chatConnection?.invoke('SubscribeForNotifications', subscription)
    .catch(error => {
      console.log(error);
    });
  }

  uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('username', this.myName);

    return this.httpClient.post(`${environment.apiUrl}chat/upload-profile-picture`, formData, {responseType:'text', withCredentials:true});
  }

  deleteProfilePicture() {
    const formData = new FormData();
    formData.append('username', this.myName);

    return this.httpClient.post(`${environment.apiUrl}chat/delete-profile-picture`, formData, {responseType:'text', withCredentials:true});
  }

  editMessage(message: Message, content?: string) {
    message.content = content!;
    return this.chatConnection?.invoke('EditMessage', message)
    .catch(error => {
      console.log(error);
    });
  }

  deleteMessage(message: Message) {
    return this.chatConnection?.invoke('DeleteMessage', message)
    .catch(error => {
      console.log(error);
    });

    // return this.httpClient.delete(`${environment.apiUrl}chatMessage/${id}`, {withCredentials:true});
  }

  setEditingMessage(message: Message) {
    this.editingMessageSource.next(message);
  }

  getImageFromBytes(imageBytes: Uint8Array | undefined, isMyPicture = false) {
    if (imageBytes == null) {
      return '../../../assets/images/48x48.svg';
    }

    let objectURL = 'data:image/gif;base64,' + imageBytes;
    const result = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    if (isMyPicture) {
      this.myProfilePicture = result;
    }
    
    return result;
  }

  private applyNotifications(notifications?: Notification[]) {
    if (notifications == undefined) {
      return;
    }
    
    notifications.forEach(element => {
      const index = this.privateChats.findIndex(s => s.privateChatId == element.chatRoomId);
      this.privateChats[index].unread = element.unreadMessages;
    });
  }
}
