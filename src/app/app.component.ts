import { Component, ViewEncapsulation, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from './services/auth.service';
import { AppState } from './app.service';
import { SharedAppStateService } from './services/sharedappstate.service';


@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [ './app.style.css' ],
  templateUrl: './app.template.html'
})
export class App {
  private viewContainerRef: ViewContainerRef;

  treeFilter: string;
  loggedUserInfo: any;
  loggedUserInfoSubscription: Subscription;

  oauth2ClientId: string;
  oauth2ProviderUrl: string;
  oauth2TokenProxyUrl: string;

  constructor(
    viewContainerRef:ViewContainerRef,
    public appState: AppState,
    public authService: AuthService,
    public sharedAppStateService: SharedAppStateService
  ) {
    this.viewContainerRef = viewContainerRef;
  }


  ngOnInit() {
    //console.log('Initial App State', this.appState.state);
    this.oauth2ClientId = process.env.OAUTH2_CLIENT_ID;
    this.oauth2ProviderUrl = process.env.OAUTH2_PROVIDER_URL;
    this.oauth2TokenProxyUrl = process.env.OAUTH2_TOKEN_PROXY_URL;

    this.treeFilter = "";

    this.loggedUserInfo = { "username": "", "uniqueid": 0, "scopes": "" };
    this.loggedUserInfoSubscription = this.sharedAppStateService.loggedUserInfo.subscribe(info => this.loggedUserInfo = info);
    
    if (localStorage.getItem('auth_token') != null) {
      this.authService.getUserinfo()
        .subscribe(
          (userinfo) => {
            this.sharedAppStateService.updateLoggedUserInfo(userinfo);
          },
          (error) => console.log('Failed to retrieve user info'),
          () => {
            
          }
        );
    }
  }


  ngOnDestroy() {
    if (this.loggedUserInfoSubscription != null) {
      this.loggedUserInfoSubscription.unsubscribe();
    }
  }

}
