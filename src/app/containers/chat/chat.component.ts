import { Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ChatService } from 'src/app/services/chat.service';
import { PrivateChatComponent } from '../private-chat/private-chat.component';
import { User } from '../../models/user';
import { NotificationMiddlewareService } from 'src/app/services/core/notification-middleware.service';
import { ModalService } from '../_modal';
import { Chat } from 'src/app/models/chat';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Output() closeChatEmitter = new EventEmitter();
  toUser: string = '';
  // leftSideWidth = 600;
  // rightSideWidth = 1320;
  leftSideWidth = 30;
  rightSideWidth = 70;
  openPrivateConversation: boolean = false;
  selectedFile: File | null = null;
  imageUrl: string | null = null;
  toOpenMenu = false;
  search='';

  constructor(public chatService: ChatService, private authService: AuthService, public notificationMiddleware: NotificationMiddlewareService, private modalService: ModalService) {}

  ngOnDestroy(): void {
    this.chatService.stopChatConnection();
  }

  ngOnInit(): void {
    this.authService.setToken();
    if (this.authService.isLoggedIn) {
      this.chatService.myName = this.authService.getUserName();
      this.chatService.myEmail = this.authService.getEmail();
      
      const user: User = {
        profilePicture: this.chatService.myProfilePicture,
        name: this.chatService.myName,
        email: this.chatService.myEmail,
      }

      this.chatService.registerUser(user).subscribe();
    }

    this.chatService.createChatConnection();

    if (!this.notificationMiddleware.pushNotificationStatus.isSubscribed) {
      this.notificationMiddleware.subscribe();
    }
  }

  logout() {
    this.closeChatEmitter.emit();
  }

  backToHome() {
    this.chatService.closePrivateChatMessage(this.toUser);
    this.toUser = '';
    this.openPrivateConversation = false;
  }

  sendMessage(content: string) {
    this.chatService.sendMessage(content);
  }

  openPrivateChat(toUser: string) {
    if (this.toUser !== toUser && this.toUser !== '') {
      this.chatService.closePrivateChatMessage(this.toUser);
    }
    this.toUser = toUser;
    this.openPrivateConversation = true;
    this.chatService.openPrivateChat(this.toUser);
    // const modalRef = this.modalService.open(PrivateChatComponent);
    // modalRef.componentInstance.toUser = toUser;
  }

  openMenu() {
    if (this.toOpenMenu) {
      this.toOpenMenu = false;
    } else {
      this.toOpenMenu = true;
    }
  }

  sendPrivateMessage(content: string) {
    this.chatService.sendPrivateMessage(this.toUser, content);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }

    this.uploadImage();
  }

  uploadImage(): void {
    if (this.selectedFile) {
      this.chatService.uploadProfilePicture(this.selectedFile).subscribe();
    }
  }

  deleteProfilePicture() {
    this.chatService.deleteProfilePicture().subscribe();
  }

  hoverChat(chat: Chat) {
    chat.hovered = !chat.hovered;
  }
}
