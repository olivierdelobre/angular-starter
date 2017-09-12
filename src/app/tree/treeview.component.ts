import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { TreeService } from '../services/units.service';
import { AuthService } from '../services/auth.service';
import { SharedAppStateService } from '../services/sharedappstate.service';

import { Unit } from '../model/unit.model';
import { UnitComponent } from './unit.component';

@Component({
  selector: 'app-tree-view',
  styleUrls: [ './treeview.style.css', '../app.style.css' ],
  templateUrl: './treeview.template.html',
  providers: [ TreeService ]
})
export class TreeViewComponent implements OnInit, OnDestroy {
  @Input() root: Unit;
  @Input() expandedUnits: number[];
  @Input() onlyPermanent: boolean;
  @Input() onlyValid: boolean;
  @Input() stateDate: string;

  @Output() unitSelected: EventEmitter<Unit> = new EventEmitter<Unit>();
  @Output() unitToDelete: EventEmitter<Unit> = new EventEmitter<Unit>();
  @Output() unitToCreateChild: EventEmitter<Unit> = new EventEmitter<Unit>();
  @Output() unitToClone: EventEmitter<Unit> = new EventEmitter<Unit>();
  @Output() unitOpenedOrClosed: EventEmitter<Unit> = new EventEmitter<Unit>();
  @Output() errorTriggered: EventEmitter<string> = new EventEmitter<string>();
  @Output() createOrUpdateUnitModelTriggered: EventEmitter<Unit> = new EventEmitter<Unit>();
  @Output() createOrUpdateUnitPlannedTriggered: EventEmitter<Unit> = new EventEmitter<Unit>();

  private units: Unit[];
  private unitsTemp: Unit[];
  private onlyPermanentLocal: boolean;
  private onlyValidLocal: boolean;
  private loggedUserInfo: any;
  private treeFilter: string;
  private loggedUserInfoSubscription: Subscription;
  private treeFilterSubscription: Subscription;
  private refreshParentSubscription: Subscription;
  private parentIdToRefresh: number;

  constructor(
    private treeService: TreeService,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    public sharedAppStateService: SharedAppStateService
  ) { }

  /******************************************************
  *   set expanded property of units depending on the URL params
  ******************************************************/
  setExpanded() {
    if (this.expandedUnits != null) {
      this.unitsTemp.forEach((element) => {
        if (this.expandedUnits.indexOf(element.id, 0) > -1) {
          element.expanded = true;
        }
      });
    }

    this.units = this.unitsTemp;
  }

  /******************************************************
  *   retrieve units from service
  ******************************************************/
  retrieveUnits(parentIdToRefresh?: number) {
    // console.log('treeview retrieveUnits expandedUnits = ' + this.expandedUnits);
    // console.log('treeview onlyPermanent = ' + this.onlyPermanent + ", onlyValid = " + this.onlyValid);
    
    let parentId = 0;
    if (this.root != null) {
      parentId = this.root.id;
    }

    if (parentIdToRefresh == null || parentIdToRefresh == parentId) {
      this.treeService.getUnitByParent(parentId, this.onlyPermanent, this.onlyValid, this.stateDate)
        .subscribe(
          (units) => this.unitsTemp = units,
          (error) => {
            this.propagateError('Une erreur est survenue lors de la récupération des unités');
          },
          () => this.setExpanded()
      );
    }
  }

  /******************************************************
  *   forece retrieve units from service
  ******************************************************/
  retrieveUnitsForce(onlyPermanent: boolean, onlyValid: boolean, stateDate: string, parentIdToRefresh?: number) {
    let parentId = 0;
    if (this.root != null) {
      parentId = this.root.id;
    }

    this.parentIdToRefresh = parentIdToRefresh;

    if (parentIdToRefresh == null) {
      this.treeService.getUnitByParent(parentId, onlyPermanent, onlyValid, stateDate)
        .subscribe(
          (units) => this.unitsTemp = units,
          (error) => console.log("error = " + error),
          () => this.setExpanded()
        );
    }
    else {
      // Send signal to ask to the right treeview to update itself
      this.sharedAppStateService.updateRefreshParent(parentIdToRefresh);
    }
  }

  /******************************************************
  *   expand a unit
  ******************************************************/
  expandUnit(unit: Unit) {
    unit.expand();
    this.propagateUnitOpenedOrClosed(unit);
  }

  /******************************************************
  *   propagation of selectUnit
  ******************************************************/
  selectUnit(unit: Unit) {
    this.unitSelected.emit(unit);
  }

  /******************************************************
  *   propagation of deleteUnit
  ******************************************************/
  propagateDeleteUnit(unit: Unit) {
    this.unitToDelete.emit(unit);
  }

  /******************************************************
  *   propagation of createChildUnit
  ******************************************************/
  createChildUnit(unit: Unit) {
    this.unitToCreateChild.emit(unit);
  }

  /******************************************************
  *   propagation of cloneChild
  ******************************************************/
  cloneUnit(unit: Unit) {
    this.unitToClone.emit(unit);
  }

  /******************************************************
  *   propagation of unitOpenedOrClosed
  ******************************************************/
  propagateUnitOpenedOrClosed(unit: Unit) {
    this.unitOpenedOrClosed.emit(unit);
  }

  /******************************************************
  *   propagation of error
  ******************************************************/
  propagateError(message: string) {
    this.errorTriggered.emit(message);
  }

  /******************************************************
  *   propagation of create/update unit model
  ******************************************************/
  propagateCreateOrUpdateUnitModel(unit: Unit) {
    this.createOrUpdateUnitModelTriggered.emit(unit);
  }

  /******************************************************
  *   propagation of create/update unit planned
  ******************************************************/
  propagateCreateOrUpdateUnitPlanned(unit: Unit) {
    this.createOrUpdateUnitPlannedTriggered.emit(unit);
  }

  /******************************************************
  *   on destroy
  ******************************************************/
  public ngOnDestroy() {
    // console.log('ngOnDestroy TreeViewComponent');
    this.loggedUserInfoSubscription.unsubscribe();
    this.treeFilterSubscription.unsubscribe();
    this.refreshParentSubscription.unsubscribe();
  }

  /******************************************************
  *   on init
  ******************************************************/
  public ngOnInit() {
    // console.log('ngOnInit TreeViewComponent');
    // console.log('ngOnInit treeview retrieveUnits expandedUnits = ' + this.expandedUnits);
    // console.log('ngOnInit parentIdToRefresh = ' + this.parentIdToRefresh);
    this.retrieveUnits();

    this.loggedUserInfo = { "username": "", "uniqueid": 0, "scopes": "read" };
    this.loggedUserInfoSubscription = this.sharedAppStateService.loggedUserInfo.subscribe((info) => this.loggedUserInfo = info);
    this.treeFilter = "";
    this.treeFilterSubscription = this.sharedAppStateService.treeFilter.subscribe(filter => {
      this.treeFilter = filter;
      // console.log("treeFilter change in TreeViewComponent = " + this.treeFilter);
    });
    this.refreshParentSubscription = this.sharedAppStateService.refreshParent.subscribe(
      (parentId) => {
        this.parentIdToRefresh = parentId;
        this.retrieveUnits(parentId);
      }
     ); 
  }
}
