import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';
import { ChatService } from '../chat.service';
import { PushSubscription } from '../../models/pushSubscription';


@Injectable({
  providedIn: 'root'
})
export class NotificationMiddlewareService {

  public pushNotificationStatus = {
    isSubscribed: false,
    isSupported: false,
    isInProgress: false,
  };

  private swRegistration: ServiceWorkerRegistration | null = null;


  constructor(private chatService: ChatService) { }

  init() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/assets/sw.js')
        .then(swReg => {
          console.log('Service Worker is registered', swReg);
  
          this.swRegistration = swReg;
          this.checkSubscription();
        })
        .catch(error => {
          console.error('Service Worker Error', error);
        });
      this.pushNotificationStatus.isSupported = true;
    } else {
      this.pushNotificationStatus.isSupported = false;
    }
  }
  
  checkSubscription() {
    this.swRegistration!.pushManager.getSubscription()
      .then(subscription => {
        console.log(subscription);
        console.log(JSON.stringify(subscription));
        this.pushNotificationStatus.isSubscribed = !(subscription === null);
      });
  }

  subscribe() {
    this.pushNotificationStatus.isInProgress = true;
    const applicationServerKey = this.urlB64ToUint8Array(environment.applicationServerPublicKey);
    this.swRegistration!.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
      .then(subscription => {
        console.log(JSON.parse(JSON.stringify(subscription)));
        const newSub = JSON.parse(JSON.stringify(subscription));
        const pushSub: PushSubscription = {
          auth: newSub.keys.auth,
          p256Dh: newSub.keys.p256dh,
          endPoint: newSub.endpoint
        };
        this.chatService.subscribeForNotifications(pushSub)
        .then(() => {
          this.pushNotificationStatus.isSubscribed = true;
        });
      })
      .catch(err => {
        console.log('Failed to subscribe the user: ', err);
      })
      .then(() => {
        this.pushNotificationStatus.isInProgress = false;
      });
  }

  unsubscribe() {
    this.pushNotificationStatus.isInProgress = true;
    let newSub: any = {};
    this.swRegistration!.pushManager.getSubscription()
      .then(function (subscription) {
        if (subscription) {
          newSub = JSON.parse(JSON.stringify(subscription));
          return subscription.unsubscribe();
        }

        return;
      })
      .catch(function (error) {
        console.log('Error unsubscribing', error);
      })
      .then(() => {
        const pushSub: PushSubscription = {
          auth: newSub.keys.auth, 
          p256Dh: newSub.keys.p256dh,
          endPoint: newSub.endpoint
        };
        this.chatService.unsubscribeFromNotifications(pushSub)
        .then(() => {
          this.pushNotificationStatus.isSubscribed = false;
          this.pushNotificationStatus.isInProgress = false;
        });
      });
  }

  toggleSubscription() {
    if (this.pushNotificationStatus.isSubscribed) {
      this.unsubscribe();
    } else {
      this.subscribe();
    }
  }

  private urlB64ToUint8Array(base64String: any) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
