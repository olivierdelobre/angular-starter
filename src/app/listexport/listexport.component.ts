import { Component, ViewChild, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ModalDirective, TabDirective } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';

import { AuthService } from '../services/auth.service';
import { TreeService } from '../services/units.service';
import { SharedAppStateService } from '../services/sharedappstate.service';

import { Utils } from '../common/utils';

@Component({
  selector: 'list-export',
  providers: [ TreeService, AuthService ],
  styleUrls: [ './listexport.style.css', '../app.style.css' ],
  templateUrl: './listexport.template.html',
})
export class ListExportComponent implements OnInit, OnDestroy {

  @ViewChild('changeStateDateModal') changeStateDateModal: ModalDirective;
  private stateDateForm: FormGroup;
  private stateDate: string;
  private stateDateDate: Date = new Date();
  private dateValidationPattern: string = '^(0?[1-9]|[12][0-9]|3[01])[\\.](0?[1-9]|1[012])[\\.](\\d{2}|\\d{4})$';
  private loggedUserInfo: any;
  private loggedUserInfoSubscription: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private treeService: TreeService,
    private sharedAppStateService: SharedAppStateService) {}

  /******************************************************
  *   change state date
  ******************************************************/
  private changeStateDate() {
    this.stateDate = Utils.getFormattedDate(this.stateDateForm.get('state_date').value, this.dateValidationPattern);
    this.stateDateDate = new Date(+this.stateDate.substring(0, 4), +this.stateDate.substring(5, 7) - 1, +this.stateDate.substring(8, 10));
    // console.log("state date has changed = " + this.stateDate);
    this.changeStateDateModal.hide();
  }

  /******************************************************
  *   search for a unit
  ******************************************************/
  private export(hierarchy: string) {
    this.treeService.downloadExport(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      hierarchy,
      null,
      null,
      null,
      null,
      'Y',
      'Y',
      moment(this.stateDate).format("YYYYMMDD"),
      []);
  }

  public ngOnInit() {
    this.loggedUserInfo = { "username": "", "uniqueid": 0, "scopes": "" };
    this.loggedUserInfoSubscription = this.sharedAppStateService.loggedUserInfo.subscribe(
      (info) => {
        this.loggedUserInfo = info;
        if (!this.authService.isLoggedIn()) {
          localStorage.setItem('targetUrl', this.router.url);
          this.authService.redirectToLogin();
        }
      },
      (error) => {},
      () => {}
    );

    this.stateDateForm = this.fb.group({
      state_date: this.fb.control(moment().format('DD.MM.YYYY'), [Validators.required, Validators.pattern(this.dateValidationPattern)])
    });

    this.stateDate = Utils.getFormattedDate(moment().format('DD.MM.YYYY'), this.dateValidationPattern);
  }

  public ngOnDestroy() {
    if (this.loggedUserInfoSubscription != null) {
      this.loggedUserInfoSubscription.unsubscribe();
    }
  }

}
