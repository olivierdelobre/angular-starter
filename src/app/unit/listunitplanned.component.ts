import { Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ModalDirective, TabDirective } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';

import { TreeService } from '../services/units.service';
import { AuthService } from '../services/auth.service';
import { SharedAppStateService } from '../services/sharedappstate.service';

import { Unit } from '../model/unit.model';
import { Label } from '../model/label.model';
import { Attribute } from '../model/attribute.model';
import { ChangeLog } from '../model/changelog.model';
import { UnitType } from '../model/unittype.model';
import { UnitLang } from '../model/unitlang.model';
import { UnitPlanned } from '../model/unitplanned.model';

@Component({
  selector: 'app-listunitplanned',
  providers: [ TreeService, AuthService ],
  styleUrls: [ './listunitplanned.style.css', '../app.style.css' ],
  templateUrl: './listunitplanned.template.html',
  encapsulation: ViewEncapsulation.None
})
export class ListUnitPlannedComponent implements OnInit, OnDestroy {
  @ViewChild('mainModal') mainModal: ModalDirective;

  @Output() createUnitPlannedTriggered: EventEmitter<Unit> = new EventEmitter<Unit>();
  
  public showView: boolean = false;
  public changeLogs: ChangeLog[];
  public selectedUnit: Unit;
  public unitPlanneds: UnitPlanned[];
  public updateResponseContent: any;
  public changeDocForm: FormGroup;
  public loggedUserInfo: any;
  public loggedUserInfoSubscription: Subscription;  
  public changeAttachmentData: FormData;
  public deleteAttachementFileFlag: boolean = false;

  constructor(public router: Router,
    public activatedRoute: ActivatedRoute,
    private treeService: TreeService,
    public fb: FormBuilder,
    public authService: AuthService,
    public sharedAppStateService: SharedAppStateService
  ) {  }

  /******************************************************
  *   entry point for other components
  ******************************************************/
  public triggerListUnitPlanned(unit: Unit) {
    this.selectedUnit = unit;

    // Retrieve the existing planned units
    this.treeService.getUnitPlannedsForUnitId(unit.id)
      .subscribe(
        (unitPlanneds) => {
          this.unitPlanneds = unitPlanneds;
        },
        (error) => {
          console.log("Error retrieving UnitPlanneds for unit " + unit.id);
        },
        () => { }
      );
    
    this.showView = true;
    this.mainModal.show();
  }

  /******************************************************
  *   create a new unit planned
  ******************************************************/
  private createUnitPlanned() {
    console.log("create new unit planned");
    this.showView = false;
    this.mainModal.hide();
    this.createUnitPlannedTriggered.emit(this.selectedUnit);
  }

  /******************************************************
  *   closeModal
  ******************************************************/
  private closeModal() {
    this.showView = false;
    this.mainModal.hide();
  }

  private onHide() {
    this.showView = false;
  }

  /******************************************************
  *   on destroy
  ******************************************************/
  public ngOnDestroy() {
    // console.log('ngOnDestroy `UpdateUnit` component');
    this.loggedUserInfoSubscription.unsubscribe();
  }

  /******************************************************
  *   on init
  ******************************************************/
  public ngOnInit() {
    this.loggedUserInfo = { "username": "", "uniqueid": 0, "scopes": "read" };
    this.loggedUserInfoSubscription =
    this.sharedAppStateService.loggedUserInfo.subscribe((info) => this.loggedUserInfo = info);

    this.changeAttachmentData = new FormData();

    this.changeDocForm = this.fb.group({
      changeDescription: this.fb.control('')
    });
  }
}
