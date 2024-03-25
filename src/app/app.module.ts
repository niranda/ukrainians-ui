import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './containers/chat/chat.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NavbarComponent } from './containers/navbar/navbar.component';
import { FooterComponent } from './containers/footer/footer.component';
import HomeComponent from './containers/home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChatInputComponent } from './containers/chat-input/chat-input.component';
import { MessagesComponent } from './containers/messages/messages.component';
import { PrivateChatComponent } from './containers/private-chat/private-chat.component';
import { EmailConfirmationComponent } from './containers/email-confirmation/email-confirmation.component';
import { RouterModule } from '@angular/router';
import { ModalModule } from './containers/_modal';
import { UserSettingsComponent } from './containers/user-settings/user-settings.component';
import { FilterPipe } from './shared/pipes/filter.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    ChatInputComponent,
    MessagesComponent,
    PrivateChatComponent,
    EmailConfirmationComponent,
    UserSettingsComponent,
    FilterPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    ModalModule,
    RouterModule.forRoot([
      { path: 'authentication/emailconfirmation', component: EmailConfirmationComponent }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
