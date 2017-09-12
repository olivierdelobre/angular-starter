import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { SharedAppStateService } from '../services/sharedappstate.service';

@Component({
  selector: 'app-oauth2',
  providers: [ ],
  template: `&nbsp;`
})
export class OAuth2Component implements OnInit, OnDestroy {

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public authService: AuthService,
    public sharedAppStateService: SharedAppStateService
  ) { }

  /******************************************************
  *   on destroy
  ******************************************************/
  public ngOnDestroy() { }

  /******************************************************
  *   on init
  ******************************************************/
  public ngOnInit() {
    let sub: any;

    sub = this.route.params.subscribe((params) => {
      let tokensParam: string = params['token'];
      let tokensArray: string[] = tokensParam.split('|');
      for (let tokensArrayItem of tokensArray) {
        let token: string[] = tokensArrayItem.split('.');
        if (token[0] == 'Units') {
          console.log('url params changed, new token = ' + token[1]);
          localStorage.setItem('auth_token', token[1]);

          // retrieve token info and push update
          this.authService.getUserinfo()
            .subscribe(
              (userinfo) => {
                this.sharedAppStateService.updateLoggedUserInfo(userinfo);
              },
              (error) => console.log('Failed to retrieve user info'),
              () => {
                this.router.navigateByUrl('/arbre');
              }
            );
        }        
      }
    });

  }
}
