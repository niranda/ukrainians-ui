import { Component } from '@angular/core';
import { ChatService } from 'src/app/services/chat.service';
import { ChatComponent } from '../chat/chat.component';
import HomeComponent from '../home/home.component';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent {
  infoMessage: string;
  
  constructor(private homeComponent: HomeComponent, public chatComponent: ChatComponent, public chatService: ChatService) {}

  logout() {
    this.homeComponent.closeChat();
  }

  backToHome() {
    this.chatComponent.backToHome();
  }

  onFileSelected(event: any): void {
    this.chatComponent.onFileSelected(event);
    this.infoMessage = "Refresh the page to see your new profile picture";
  }

  deleteProfilePicture() {
    this.chatComponent.deleteProfilePicture();
    this.infoMessage = "Refresh the page to see changes";
  }
}
