import { Component, ViewChild, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ModalDirective, TabDirective } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';

import { TreeService } from '../services/units.service';
import { AuthService } from '../services/auth.service';
import { SciperService } from '../services/sciper.service';
import { CadiService } from '../services/cadi.service';
import { SharedAppStateService } from '../services/sharedappstate.service';

import { Unit } from '../model/unit.model';
import { Label } from '../model/label.model';
import { Attribute } from '../model/attribute.model';
import { UnitPlanned } from '../model/unitplanned.model';
import { UnitModel } from '../model/unitmodel.model';

import { TreeViewComponent } from './treeview.component';
import { UpdateUnitComponent } from '../unit/updateunit.component';
import { CreateUnitComponent } from '../unit/createunit.component';
import { DeleteUnitComponent } from '../unit/deleteunit.component';
import { ChangeDocComponent } from '../changedoc/changedoc.component';
import { ListUnitPlannedComponent } from '../unit/listunitplanned.component';

@Component({
  selector: 'app-tree',
  providers: [ TreeService, AuthService, SciperService, CadiService ],
  styleUrls: [ './tree.style.css', '../app.style.css' ],
  templateUrl: './tree.template.html',
  encapsulation: ViewEncapsulation.None /* required to be able to override primeNG styles */
})
export class TreeComponent implements OnInit, OnDestroy {
  @ViewChild('createUnitModal') createUnitModal: ModalDirective;
  @ViewChild('changeStateDateModal') changeStateDateModal: ModalDirective;
  @ViewChild('rootTreeView') rootTreeView: TreeViewComponent;
  @ViewChild('stackedModal') stackedModal: ModalDirective;
  @ViewChild('myUpdateUnitComponent') myUpdateUnitComponent: UpdateUnitComponent;
  @ViewChild('myDeleteUnitComponent') myDeleteUnitComponent: DeleteUnitComponent;
  @ViewChild('myListUnitPlannedComponent') myListUnitPlannedComponent: ListUnitPlannedComponent;
  //@ViewChild('myChangeDocComponent') myChangeDocComponent: ChangeDocComponent;

  private root: Unit;
  private selectedUnit: Unit;
  private selectedUnitAttributes: Attribute[];
  private selectedUnitAddress: string;
  private selectedUnitAttribute: Attribute;
  private unitToDelete: Unit;
  private unitToCreateChild: Unit;
  private selectedUnitPlanned: UnitPlanned = new UnitPlanned({});
  private selectedUnitModel: UnitModel = new UnitModel({});  
  private stateDateForm: FormGroup;  
  private labelENG: Label;
  private labelDEU: Label;
  private labelITA: Label;
  private startDate: Date = new Date();
  private endDate: Date = new Date();
  private stateDate: string;
  private stateDateDate: Date = new Date();
  private openedIds: string;
  private onlyPermanent: boolean;
  private onlyValid: boolean;
  private expandedUnits: number[];
  private searchPersonQuery: string;  
  private resultsPerson: any[];
  private resultsRoom: any[];
  private myunit: Unit;
  private matchingResponsible: any;
  private matchingRoom: any;
  private unitTypesList: any[];
  private languagesList: any[];
  private attributesList: any[];
  private creationMode: string = "";
  private loggedUserInfo: any;
  private treeFilter: string;
  private loggedUserInfoSubscription: Subscription;
  private treeFilterSubscription: Subscription;
  public alerts: Array<Object> = [];
  private dateValidationPattern: string = '^(0[1-9]|[12][0-9]|3[01])[\\.](0[1-9]|1[012])[\\.]\\d{4}$';
  
  constructor(public router: Router,
    public activatedRoute: ActivatedRoute,
    private treeService: TreeService,
    public fb: FormBuilder,
    public authService: AuthService,
    public sciperService: SciperService,
    public cadiService: CadiService,
    public sharedAppStateService: SharedAppStateService
  ) {  }

  /******************************************************
  *   unit has been opened or closed in a nested treeview component
  ******************************************************/
  private unitOpenedOrClosed(unit: Unit) {
    let message: string = 'expanded';
    if (!unit.expanded) {
      message = 'collapsed';
      let index: number = this.expandedUnits.indexOf(unit.id, 0);
      if (index > -1) {
        this.expandedUnits.splice(index, 1);
      }
    }
    else {
      this.expandedUnits.push(unit.id);
    }
    // console.log('unit ' + unit.id + ' has been ' + message);
    // console.log('expandedUnits = ' + this.expandedUnits);
  }

  /******************************************************
  *   error is triggered somewhere in the tree
  ******************************************************/
  private errorTriggered(message: string) {
    this.alerts.push({msg: message, type: 'danger', closable: true});
    // console.log('unit ' + unit.id + ' has been ' + message);
    // console.log('expandedUnits = ' + this.expandedUnits);
  }

  /******************************************************
  *   message is triggered somewhere in the tree
  ******************************************************/
  private messageTriggered(event: any) {
    this.alerts.push({msg: event.message, type: event.level, closable: true});
  }

  /******************************************************
  *   unit has been updated in UpdateUnitComponent
  ******************************************************/
  private unitUpdated(data: any) {
    let mode = data.mode;
    let changeLogs = data.changelogs;
    let unitUpdated = data.unit;
    let previousParentId = data.previousParentId;
    // console.log('unit updated, mode = ' + mode);
    // console.log('unit updated, generatedChangeLogs = ' + JSON.stringify(changeLogs));
    // console.log('unit updated or created = ' + JSON.stringify(unitUpdated));
    this.rootTreeView.retrieveUnitsForce(this.onlyPermanent, this.onlyValid, this.stateDate, unitUpdated.parentId);
    if (previousParentId != 0) {
      this.rootTreeView.retrieveUnitsForce(this.onlyPermanent, this.onlyValid, this.stateDate, previousParentId);
    }

    if (mode == 'SAVE_AND_CLOSE' && changeLogs.length > 0) {
      //this.myChangeDocComponent.triggerCreateChangeDoc(JSON.stringify(changeLogs));
    }
  }

  /******************************************************
  *   unit has been deleted in DeleteUnitComponent
  ******************************************************/
  private unitDeleted(unit: Unit) {
    this.rootTreeView.retrieveUnitsForce(this.onlyPermanent, this.onlyValid, this.stateDate, unit.parentId);
  }

  /******************************************************
  *   unit planned action is finished
  ******************************************************/
  private unitPlannedDone(data: any) {
    let mode = data.mode;
    let unitPlanned = data.unitPlanned;

    this.rootTreeView.retrieveUnitsForce(this.onlyPermanent, this.onlyValid, this.stateDate, unitPlanned.parentId);
    
    if (mode == 'SAVE_AND_CLOSE' && unitPlanned != null) {
      //this.myChangeDocComponent.triggerCreateChangeDocForUnitPlanned(unitPlanned);
    }
  }

  /******************************************************
  *   unit model action is finished
  ******************************************************/
  private unitModelDone(unit: UnitModel) {
    this.rootTreeView.retrieveUnitsForce(this.onlyPermanent, this.onlyValid, this.stateDate, unit.parentId);
  }

  /******************************************************
  *   changedoc has been created
  ******************************************************/
  private changeDocCreated(unit: Unit) {
    console.log("changeDocCreated");
  }

  /******************************************************
  *   show popup to confirm deletion of a unit
  ******************************************************/
  private deleteUnit(unit: Unit) {
    // console.log('confirm delete unit ? ' + unit.id + ' ' + unit.sigle);

    this.selectedUnit = new Unit({});
    this.unitToDelete = unit;
    // this.deleteConfirmationModal.show();
    this.myDeleteUnitComponent.triggerDeleteUnit(this.unitToDelete);
  }

  /******************************************************
  *   show form to create child unit
  ******************************************************/
  private createChildUnit(unit?: Unit) {
    if (unit) {
      this.unitToCreateChild = unit;
      this.creationMode = "CREATE_CHILD";
    }
    else {
      this.unitToCreateChild = new Unit({"id": 0});
      this.creationMode = "CREATE_ROOT";
    }

    console.log('createChildUnit for ' + this.unitToCreateChild.id);
    
    this.myUpdateUnitComponent.triggerEditUnit(this.unitToCreateChild, this.creationMode, true);
  }

  /******************************************************
  *   create or update a unit planned
  ******************************************************/
  private listUnitPlanned(unit: Unit) {
    this.myListUnitPlannedComponent.triggerListUnitPlanned(unit);
  }

  /******************************************************
  *   create or update a unit planned
  ******************************************************/
  private createUnitPlannedTriggered(unit: Unit) {
    this.treeService.getUnitById(unit.id)
      .subscribe(
        (unitToBuildFrom) => {
          // initiate a new unit planned from selected unit
          this.selectedUnitPlanned = UnitPlanned.fromUnit(unitToBuildFrom);
        },
        (error) => console.log('Error getting Unitw with id ' + unit.id),
        () => {
          // console.log('unit planned created from unit ' + JSON.stringify(this.selectedUnitPlanned));
          this.myUpdateUnitComponent.triggerUnitPlanned(unit, this.selectedUnitPlanned, false);
        }
      );
  }

  /******************************************************
  *   create or update a unit planned
  ******************************************************/
  private updateUnitPlannedTriggered(unitPlanned: UnitPlanned) {
    // console.log('Update UnitPlanned ' + JSON.stringify(unitPlanned));
    this.treeService.getUnitById(unitPlanned.unitId)
      .subscribe(
        (unit) => {
          this.selectedUnit = unit;
        },
        (error) => console.log('Error getting Unit with id ' + unitPlanned.unitId),
        () => {
          this.treeService.getUnitPlannedById(unitPlanned.id)
            .subscribe(
              (unitPlanned) => {
                // initiate a new unit planned from selected unit
                this.selectedUnitPlanned = unitPlanned;
              },
              (error) => console.log('Error getting UnitPlanned with id ' + unitPlanned.id),
              () => {
                this.myUpdateUnitComponent.triggerUnitPlanned(this.selectedUnit, this.selectedUnitPlanned, true);
              }
            );
        }
      );
    
  }

  /******************************************************
  *   create or update a unit model
  ******************************************************/
  private createOrUpdateUnitModel(unit: Unit) {
    this.treeService.getUnitModelById(unit.id)
      .subscribe(
        (unitModel) => {
          this.selectedUnitModel = unitModel;
        },
        (error) => {
          // console.log('error getting unit model, getting unit details to build unit model');
          this.treeService.getUnitById(unit.id)
          .subscribe(
            unitToBuildFrom => {
              // initiate a new unit planned from selected unit
              this.selectedUnitModel = UnitModel.fromUnit(unitToBuildFrom);
            },
            (error) => console.log('error getting unit'),
            () => {
              // console.log('unit model created from unit ' + JSON.stringify(this.selectedUnitModel));
              //this.myUnitModelComponent.triggerUnitModel(this.selectedUnitModel, false);
              this.myUpdateUnitComponent.triggerUnitModel(this.selectedUnitModel, false);
            }
          );
        },
        () => {
          //this.myUnitModelComponent.triggerUnitModel(this.selectedUnitModel, true);
          this.myUpdateUnitComponent.triggerUnitModel(this.selectedUnitModel, true);
        }
      );
  }

  /******************************************************
  *   show form to clone a unit
  ******************************************************/
  private cloneUnit(unit: Unit) {
    console.log('cloneUnit ' + unit.id);

    this.creationMode = "CLONE";

    this.myUpdateUnitComponent.triggerEditUnit(unit, this.creationMode, true);
  }

  /******************************************************
  *   a unit is selected
  ******************************************************/
  private selectUnit(unit: Unit) {
    // console.log('selectUnit ' + unit.id + ' ' + unit.sigle);
    this.unitToDelete = new Unit({});
    this.unitToCreateChild = new Unit({});

    this.treeService.getUnitById(unit.id)
      .subscribe(
        (unit) => this.selectedUnit = unit,
        (error) => console.log('error getting unit'),
        () => {
          this.myUpdateUnitComponent.triggerEditUnit(this.selectedUnit, 'UPDATE', true);
        }
      );
  }

  /******************************************************
  *   filter has changed
  ******************************************************/
  private filterHasChanged() {
    console.log("checkOnlyPermanent = " + this.onlyPermanent + ", checkOnlyValid = " + this.onlyValid);
    this.rootTreeView.retrieveUnitsForce(this.onlyPermanent, this.onlyValid, this.stateDate);
  }

  /******************************************************
  *   change state date
  ******************************************************/
  private changeStateDate() {
    let formValue: string = this.stateDateForm.get('state_date').value;
    this.stateDate = formValue.substring(6, 10) + formValue.substring(3, 5) + formValue.substring(0, 2);
    this.stateDateDate = new Date(+formValue.substring(6, 10), +formValue.substring(3, 5) - 1, +formValue.substring(0, 2));
    console.log("state date has changed = " + this.stateDate);
    this.changeStateDateModal.hide();
    this.rootTreeView.retrieveUnitsForce(this.onlyPermanent, this.onlyValid, this.stateDate);
  }

  /******************************************************
  *   close an alert popup
  ******************************************************/
  public closeAlert(i:number): void {
    this.alerts.splice(i, 1);
  }

  /******************************************************
  *   quick search/filter
  ******************************************************/
  private filterTree() {
    this.sharedAppStateService.updateTreeFilter(this.treeFilter);
  }

  /******************************************************
  *   on destroy
  ******************************************************/
  public ngOnDestroy() {
    // console.log('ngOnDestroy `Tree` component');
    this.loggedUserInfoSubscription.unsubscribe();
    this.treeFilterSubscription.unsubscribe();
  }

  /******************************************************
  *   on init
  ******************************************************/
  public ngOnInit() {
    // console.log('ngOnInit `Tree` component');

    this.stateDate = moment().format('YYYYMMDD');

    this.root = null;
    this.selectedUnit = new Unit({});
    this.unitToDelete = new Unit({});
    this.unitToCreateChild = new Unit({});
    this.selectedUnitAttributes = [];
    this.onlyPermanent = true;
    this.onlyValid = true;
    this.expandedUnits = Array();
    this.selectedUnitAddress = '';

    this.labelENG = new Label("{}");
    this.labelDEU = new Label("{}");
    this.labelITA = new Label("{}");

    console.log('auth_token = ' + localStorage.getItem('auth_token'));

    this.loggedUserInfo = { "username": "", "uniqueid": 0, "scopes": "read" };
    this.loggedUserInfoSubscription =
      this.sharedAppStateService.loggedUserInfo.subscribe((info) => this.loggedUserInfo = info);

    this.treeFilter = "";
    this.treeFilterSubscription = this.sharedAppStateService.treeFilter.subscribe(
      filter => {
        this.treeFilter = filter;
        // console.log("treeFilter change in TreeComponent = " + this.treeFilter);
        if (filter != "") {
          this.treeService.searchUnitsTree(this.treeFilter, this.onlyPermanent, this.onlyValid).subscribe(
            (units) => {
              // console.log("Following units have to be opened = " + JSON.stringify(units));
              this.expandedUnits = Array();
              for (let unit of units) {
                // if unit not in the expandedUnits list, add it
                if (this.expandedUnits.indexOf(unit.id, 0) == -1) {
                  this.expandedUnits.push(unit.id);
                }
              }
            },
            (error) => console.log("An error occurred while retrieving units to open"),
            () => {
              this.rootTreeView.retrieveUnitsForce(this.onlyPermanent, this.onlyValid, this.stateDate);
            }
          );
        }
      }
    );

    this.stateDateForm = this.fb.group({
      state_date: this.fb.control(moment().format('DD.MM.YYYY'), [Validators.required, Validators.pattern(this.dateValidationPattern)])
    });
  }
}
