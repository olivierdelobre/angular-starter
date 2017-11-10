import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../services/auth.service';
import { SharedAppStateService } from '../services/sharedappstate.service';

@Component({
  selector: 'app-logout',
  providers: [ ],
  styleUrls: [ ],
  template: ``
})
export class LogoutComponent implements OnInit, OnDestroy {

  constructor(
    public router: Router,
    public authService: AuthService,
    public sharedAppStateService: SharedAppStateService
  )
  { }

  /******************************************************
  *   on destroy
  ******************************************************/
  public ngOnDestroy() { }

  /******************************************************
  *   on init
  ******************************************************/
  public ngOnInit() {
    this.authService.logout();
    this.router.navigate(['/arbre']);
    this.sharedAppStateService.updateLoggedUserInfo({ "username": "", "uniqueid": 0, "scopes": "" });
  }
}
