import { Component, ViewChild, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';

import { ModalDirective, TabDirective } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';

import { TreeService } from '../services/units.service';
import { AuthService } from '../services/auth.service';
import { SciperService } from '../services/sciper.service';
import { CadiService } from '../services/cadi.service';
import { SharedAppStateService } from '../services/sharedappstate.service';

import { Unit } from '../model/unit.model';
import { UnitPlanned } from '../model/unitplanned.model';
import { UnitModel } from '../model/unitmodel.model';
import { Label } from '../model/label.model';

import { UpdateUnitComponent } from '../unit/updateunit.component';
import { DeleteUnitComponent } from '../unit/deleteunit.component';
import { ListUnitPlannedComponent } from '../unit/listunitplanned.component';

import { Utils } from '../common/utils';

import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-search',
  providers: [ TreeService, AuthService, SciperService, CadiService ],
  styleUrls: [ './search.style.css', '../app.style.css' ],
  templateUrl: './search.template.html'
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('myUpdateUnitComponent') myUpdateUnitComponent: UpdateUnitComponent;
  @ViewChild('myDeleteUnitComponent') myDeleteUnitComponent: DeleteUnitComponent;
  @ViewChild('myListUnitPlannedComponent') myListUnitPlannedComponent: ListUnitPlannedComponent;
  @ViewChild('changeStateDateModal') changeStateDateModal: ModalDirective;
  @ViewChild('selectSearchResponsibleModal') selectSearchResponsibleModal: ModalDirective;
  
  private searchForm: FormGroup;
  private searchResults: any[];
  private selectedUnit: Unit = new Unit({});
  private selectedUnitLabels: Label[];
  private selectedUnitPlanned: UnitPlanned = new UnitPlanned({});
  private selectedUnitModel: UnitModel = new UnitModel({});
  private matchingResponsible: any;
  private matchingRoom: any;
  private unitTypesList: any[];
  private languagesList: any[];
  private labelENG: Label;
  private labelGER: Label;
  private labelITA: Label;
  private resultsPerson: any[];
  private resultsRoom: any[];
  private alerts: Array<Object> = [];
  private attributesList: any[];
  private attributeCriteriaForms: FormGroup[];
  private attributeCriterias: any[];
  private loggedUserInfo: any;
  private loggedUserInfoSubscription: Subscription;
  private stateDate: string;
  private stateDateDate: Date = new Date();
  private dateValidationPattern: string = '^(0?[1-9]|[12][0-9]|3[01])[\\.](0?[1-9]|1[012])[\\.](\\d{2}|\\d{4})$';
  private stateDateForm: FormGroup;
  private searchIsTriggered: boolean = false;
  private searchMode: string = '';
  private searchIsOngoing: boolean = false;
  private searchReponsibleResults: any[];
  private searchReponsibleShowResults: boolean = false;
  private searchReponsibleErrorMessage: string;
  private searchResponsibleIsOngoing: boolean = false;
  private selectedResponsible: any;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private treeService: TreeService,
    private fb: FormBuilder,
    private authService: AuthService,
    private sciperService: SciperService,
    private cadiService: CadiService,
    private sharedAppStateService: SharedAppStateService
  ) {  }

  /******************************************************
  *   search for a unit
  ******************************************************/
  private searchUnit(mode: string, showAlerts: boolean = true) {
    this.searchMode = mode;
    this.searchIsTriggered = true;
    if (this.searchForm.get('responsibleSearchText').value != '') {
      this.searchResponsible();
      return;
    }

    this.searchIsOngoing = true;

    /*
    console.log("search params are: " +
      this.searchForm.get('sigle').value + ", " +
      this.searchForm.get('label').value + ", " +
      this.searchForm.get('cf').value + ", " +
      this.searchForm.get('type').value + ", " +
      this.searchForm.get('level').value + ", " +
      this.searchForm.get('createdAtStart').value + ", " +
      this.searchForm.get('createdAtEnd').value + ", " +
      this.searchForm.get('updatedAtStart').value + ", " +
      this.searchForm.get('updatedAtEnd').value + ", " +
      this.searchForm.get('onlyPermanent').value + ", " +
      this.searchForm.get('onlyValid').value);
    */
    
    let attributesCriterias: any[] = [];
    let criterias = <FormArray>this.searchForm.controls['attribute_criterias'];
    for (let i = 0; i < criterias.length; i++) {
      //we retrieve a formgroup
      let criteria = criterias.at(i);
      console.log("criteria " + i + " " + criteria.get('search_attribute_code').value);
      attributesCriterias.push({"code": criteria.get('search_attribute_code').value, "value": criteria.get('search_value').value});
    }
    // console.log("attributesCriterias = " + JSON.stringify(attributesCriterias));

    if (this.searchForm.get('sigle').value == ''
        && this.searchForm.get('label').value == ''
        && this.searchForm.get('cf').value == ''
        && this.searchForm.get('type').value == ''
        && this.searchForm.get('level').value == ''
        && this.searchForm.get('hierarchy').value == ''
        && (this.searchForm.get('responsibleId').value == '' || this.searchForm.get('responsibleId').value == '0')
        && this.searchForm.get('createdAtStart').value == ''
        && this.searchForm.get('createdAtEnd').value == ''
        && this.searchForm.get('updatedAtStart').value == ''
        && this.searchForm.get('updatedAtEnd').value == ''
        && attributesCriterias.length == 0) {
      this.searchResults = null;
      this.searchIsOngoing = false;
      this.alerts.push({msg: "Vous devez sélectionner au moins 1 critère", type: 'danger', closable: true});
      return;
    }

    if (mode == "search") {
      this.treeService.searchUnits('%25' + this.searchForm.get('sigle').value + '%25',
        '%25' + this.searchForm.get('label').value + '%25',
        null,
        '%25' + this.searchForm.get('cf').value + '%25',
        this.searchForm.get('type').value,
        this.searchForm.get('level').value,
        this.searchForm.get('responsibleId').value,
        this.searchForm.get('hierarchy').value + '%25',
        Utils.getFormattedDate(this.searchForm.get('createdAtStart').value, this.dateValidationPattern, "", ""),
        Utils.getFormattedDate(this.searchForm.get('createdAtEnd').value, this.dateValidationPattern, "", ""),
        Utils.getFormattedDate(this.searchForm.get('updatedAtStart').value, this.dateValidationPattern, "", ""),
        Utils.getFormattedDate(this.searchForm.get('updatedAtEnd').value, this.dateValidationPattern, "", ""),
        this.searchForm.get('onlyPermanent').value,
        this.searchForm.get('onlyValid').value,
        moment(this.stateDate).format("YYYYMMDD"),
        attributesCriterias)
        .subscribe(
          (res) => this.searchResults = res,
          (error) => {
            console.log("Error retrieving search results");
            this.searchResults = [];
            this.searchResults = null;
            this.searchIsOngoing = false;
          },
          () => {
            if (showAlerts) {
              this.alerts.push({msg: this.searchResults.length + " résultat(s) trouvé(s)", type: 'success', closable: true});
            }
            this.searchIsOngoing = false;
          }
        );
    }
    else if (mode == "export") {
      this.treeService.downloadExport('%25' + this.searchForm.get('sigle').value + '%25',
        '%25' + this.searchForm.get('label').value + '%25',
        null,
        '%25' + this.searchForm.get('cf').value + '%25',
        this.searchForm.get('type').value,
        this.searchForm.get('level').value,
        this.searchForm.get('responsibleId').value,
        this.searchForm.get('hierarchy').value + '%25',
        Utils.getFormattedDate(this.searchForm.get('createdAtStart').value, this.dateValidationPattern, "", ""),
        Utils.getFormattedDate(this.searchForm.get('createdAtEnd').value, this.dateValidationPattern, "", ""),
        Utils.getFormattedDate(this.searchForm.get('updatedAtStart').value, this.dateValidationPattern, "", ""),
        Utils.getFormattedDate(this.searchForm.get('updatedAtEnd').value, this.dateValidationPattern, "", ""),
        this.searchForm.get('onlyPermanent').value,
        this.searchForm.get('onlyValid').value,
        moment(this.stateDate).format("YYYYMMDD"),
        attributesCriterias
      ).subscribe(
        (response: any) => {                   
          FileSaver.saveAs(response.blob(), "export.csv");
        },
        (error) => console.log('Error retrieving file'),
        () => {
          this.searchIsOngoing = false;
        }
      );
    }
  }

  /******************************************************
  *   change state date
  ******************************************************/
  private changeStateDate() {
    this.stateDate = Utils.getFormattedDate(this.stateDateForm.get('stateDate').value, this.dateValidationPattern);
    this.stateDateDate = new Date(+this.stateDate.substring(0, 4), +this.stateDate.substring(5, 7) - 1, +this.stateDate.substring(8, 10));
    // console.log("state date has changed = " + this.stateDate);
    this.changeStateDateModal.hide();
  }

  /******************************************************
  *   message is triggered somewhere in the tree
  ******************************************************/
  private messageTriggered(event: any) {
    this.alerts.push({msg: event.message, type: event.level, closable: true});
  }

  /******************************************************
  *   add attribute criteria
  ******************************************************/
  private addAttributeCriteria() {
    let newForm: FormGroup;
    newForm = this.fb.group({
      search_attribute_code: this.fb.control(this.attributesList[0].code, Validators.required),
      search_value: this.fb.control('', Validators.required)
    });

    let criterias = <FormArray>this.searchForm.controls['attribute_criterias'];
    criterias.push(newForm);
  }

  /******************************************************
  *   remove attribute criteria
  ******************************************************/
  private removeAttributeCriteria(i: number) {
    let criterias = <FormArray>this.searchForm.controls['attribute_criterias'];
    criterias.removeAt(i);
  }

  /******************************************************
  *   a unit is selected
  ******************************************************/
  private selectUnit(unit: Unit) {
    this.treeService.getUnitById(unit.id)
      .subscribe(
        unit => this.selectedUnit = unit,
        (error) => console.log('error getting unit'),
        () => {
          this.myUpdateUnitComponent.triggerEditUnit(this.selectedUnit, 'UPDATE', true);
        }
      );
  }

  /******************************************************
  *   a unit is deleted
  ******************************************************/
  private deleteUnit(unit: Unit) {
    this.treeService.getUnitById(unit.id)
      .subscribe(
        unit => this.selectedUnit = unit,
        (error) => console.log('error getting unit'),
        () => {
          this.myDeleteUnitComponent.triggerDeleteUnit(this.selectedUnit);
        }
      );
  }

  /******************************************************
  *   create a unit planned
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
  *   update a unit planned
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
        unitModel => {
          this.selectedUnitModel = unitModel;
        },
        (error) => {
          // console.log('error getting unit model, getting unit details to build unit model');
          this.treeService.getUnitById(unit.id)
          .subscribe(
            unitToBuildFrom => {
              //initiate a new unit planned from selected unit
              this.selectedUnitModel = UnitModel.fromUnit(unitToBuildFrom);
            },
            (error) => console.log('error getting unit'),
            () => {
              // console.log('unit model created from unit ' + JSON.stringify(this.selectedUnitModel));
              this.myUpdateUnitComponent.triggerUnitModel(this.selectedUnitModel, false);
            }
          );
        },
        () => {
          this.myUpdateUnitComponent.triggerUnitModel(this.selectedUnitModel, true);
        }
      );
  }

  /******************************************************
  *   create or update a unit planned
  ******************************************************/
  private listUnitPlanned(unit: Unit) {
    this.myListUnitPlannedComponent.triggerListUnitPlanned(unit);
  }

  /******************************************************
  *   unit has been deleted in DeleteUnitComponent
  ******************************************************/
  private unitUpdated(data: any) {
    let mode = data.mode;
    let changeLogs = data.changelogs;

    this.searchUnit("search", false);
  }

  /******************************************************
  *   unit has been deleted in DeleteUnitComponent
  ******************************************************/
  private unitDeleted(unit: Unit) {
    this.searchResults = this.searchResults.filter((aUnit) => aUnit.id != unit.id);
    this.searchResults = this.searchResults.slice();
    console.log('remove unit from list');
    //this.searchUnit("search", false);
  }

  /******************************************************
  *   unit planned action is finished
  ******************************************************/
  private unitPlannedDone(data: any) {
    let mode = data.mode;
    let unitPlanned = data.unitPlanned;

    this.searchUnit("search", false);
  }

  /******************************************************
  *   unit model action is finished
  ******************************************************/
  private unitModelDone(unit: UnitModel) {
    this.searchUnit("search", false);
  }

  /******************************************************
  *   for alert autoclose
  ******************************************************/
  public closeAlert(i:number): void {
    this.alerts.splice(i, 1);
  }

  /******************************************************
  *   autocomplete result for unit responsible search
  ******************************************************/
  private searchResponsible() {
    if (this.searchForm.get('responsibleSearchText').value.length < 3) {
      this.searchForm.get('responsibleSearchText').setErrors({ "error": true });
      this.searchForm.get('responsibleSearchText').markAsDirty();
      this.searchReponsibleErrorMessage = 'Vous devez saisir au moins 3 caractères';
      return;
    }

    this.searchResponsibleIsOngoing = true;
    this.sciperService.searchByName(this.searchForm.get('responsibleSearchText').value, false)
      .subscribe(
        (people) => {
          if (people.length == 1) {
            this.responsibleSelected(people[0]);
            this.searchReponsibleShowResults = false;
            if (this.searchIsTriggered) {
              this.searchUnit(this.searchMode);
              this.searchIsTriggered = false;
            }
          }
          else {
            this.selectSearchResponsibleModal.show();
            this.searchReponsibleResults = people;
            this.searchReponsibleShowResults = true;
          }
        },
        (error) => {
          console.log('Error retrieving people from sciper service');
          this.searchReponsibleResults = [];
          this.searchReponsibleShowResults = false;
          this.searchResponsibleIsOngoing = false;
          this.searchReponsibleErrorMessage = 'Invalid search (length must be at least 2 characters)';
        },
        () => {
          this.searchResponsibleIsOngoing = false;
          this.searchReponsibleErrorMessage = null;
        }
    );
  }

  /******************************************************
  *   clear responsible in form
  ******************************************************/
  private clearResponsible() {
    this.selectedResponsible = null;
    this.searchForm.get('responsibleSearchText').setValue('');
    this.searchForm.get('responsible').setValue('');
    this.searchForm.get('responsibleId').setValue(0);
  }

  /******************************************************
  *   a person is selected in the autocomplete select
  ******************************************************/
  private responsibleSelected(responsible) {
    console.log("responsible selected " + responsible.id);
    this.selectedResponsible = responsible;
    this.searchReponsibleResults = [];
    this.searchForm.get('responsibleSearchText').setValue('');
    this.searchForm.get('responsibleId').setValue(responsible.id);
    this.selectSearchResponsibleModal.hide();

    if (this.searchIsTriggered) {
      this.searchUnit(this.searchMode);
      this.searchIsTriggered = false;
    }
  }

  /******************************************************
  *   changedoc has been created
  ******************************************************/
  private changeDocCreated(unit: Unit) {
    
  }

  /******************************************************
  *   on destroy
  ******************************************************/
  public ngOnDestroy() {
    // console.log('ngOnDestroy `Tree` component');
    if (this.loggedUserInfoSubscription != null) {
      this.loggedUserInfoSubscription.unsubscribe();
    }
  }

  /******************************************************
  *   on init
  ******************************************************/
  public ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      localStorage.setItem('targetUrl', this.router.url);
      this.authService.redirectToLogin();
      return;
    }

    // console.log('ngOnInit `Tree` component');
    // console.log('auth_token = ' + localStorage.getItem('auth_token'));
    this.loggedUserInfo = { "username": "", "uniqueid": 0, "scopes": "" };
    this.loggedUserInfoSubscription = this.sharedAppStateService.loggedUserInfo.subscribe(
      (info) => {
        this.loggedUserInfo = info;
        // if (!this.authService.isLoggedIn()) {
        //   localStorage.setItem('targetUrl', this.router.url);
        //   this.authService.redirectToLogin();
        // }
      },
      (error) => {},
      () => {}
    );

    this.stateDate = Utils.getFormattedDate(moment().format('DD.MM.YYYY'), this.dateValidationPattern);

    this.selectedUnit = new Unit({});
    this.selectedUnitLabels = [];
    this.attributeCriteriaForms = [];
    this.labelENG = new Label("{}");
    this.labelGER = new Label("{}");
    this.labelITA = new Label("{}");

    this.unitTypesList = [];
    this.languagesList = [];
    this.attributesList = [];

    this.stateDateForm = this.fb.group({
      stateDate: this.fb.control(moment().format('DD.MM.YYYY'), [Validators.required, Validators.pattern(this.dateValidationPattern)])
    });

    this.searchForm = this.fb.group({
      sigle: this.fb.control(''),
      label: this.fb.control(''),
      cf: this.fb.control(''),
      type: this.fb.control(''),
      level: this.fb.control(''),
      responsible: this.fb.control(''),
      responsibleId: this.fb.control(''),
      responsibleSearchText: this.fb.control(''),
      hierarchy: this.fb.control(''),
      createdAtStart: this.fb.control('', [Validators.pattern(this.dateValidationPattern)]),
      createdAtEnd: this.fb.control('', [Validators.pattern(this.dateValidationPattern)]),
      updatedAtStart: this.fb.control('', [Validators.pattern(this.dateValidationPattern)]),
      updatedAtEnd: this.fb.control('', [Validators.pattern(this.dateValidationPattern)]),
      onlyPermanent: this.fb.control(''),
      onlyValid: this.fb.control(''),
      attribute_criterias: this.fb.array([])
    });

    // console.log('loggedUserInfo = ' + JSON.stringify(this.loggedUserInfo));
    // console.log('authService.hasSuperAdminRole = ' + this.authService.hasSuperAdminRole(this.loggedUserInfo));
    // console.log('authService.hasReadRole = ' + this.authService.hasReadRole(this.loggedUserInfo));

    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.treeService.getUnitTypes()
      .subscribe(
        (list) => {
          this.unitTypesList = list;
        },
        (error) => { console.log('error getting unit types'); },
        () => { }
      );

    this.treeService.getUnitLangs()
      .subscribe(
        (list) => {
          this.languagesList = list;
        },
        (error) => { console.log('error getting unit langs'); },
        () => { }
      );
    

    this.treeService.getAttributes('')
      .subscribe(
        (list) => {
          this.attributesList = list;
        },
        (error) => { console.log('error getting unit attributes'); },
        () => { }
      );
  }
}
