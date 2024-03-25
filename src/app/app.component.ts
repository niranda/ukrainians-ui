import { Component, OnInit } from '@angular/core';
import { NotificationMiddlewareService } from './services/core/notification-middleware.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ukrainians-ui';

  constructor(private notificationMiddleware: NotificationMiddlewareService) { }

  ngOnInit(): void {
    this.notificationMiddleware.init();
  }
}
