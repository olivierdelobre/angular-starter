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

  private treeFilter: string;
  private loggedUserInfo: any;
  private loggedUserInfoSubscription: Subscription;

  private oauth2ClientId: string;
  private oauth2ProviderUrl: string;
  private oauth2TokenProxyUrl: string;
  private version: string;

  constructor(
    viewContainerRef:ViewContainerRef,
    private appState: AppState,
    private authService: AuthService,
    private sharedAppStateService: SharedAppStateService
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
    this.loggedUserInfoSubscription = this.sharedAppStateService.loggedUserInfo.subscribe(
      (info) => {
        this.loggedUserInfo = info;
      },
      (error) => {},
      () => {}
    );
    
    if (localStorage.getItem(process.env.APP_NAME + '.Units.token') != null) {
      this.authService.getUserinfo()
        .subscribe(
          (userinfo) => {
            this.sharedAppStateService.updateLoggedUserInfo(userinfo);
          },
          (error) => console.log('Failed to retrieve user info'),
          () => {}
        );
    }
  }


  ngOnDestroy() {
    if (this.loggedUserInfoSubscription != null) {
      this.loggedUserInfoSubscription.unsubscribe();
    }
  }

}
