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
//import { UnitPlannedComponent } from '../unitplanned/unitplanned.component';
import { UnitModelComponent } from '../unitmodel/unitmodel.component';
import { ChangeDocComponent } from '../changedoc/changedoc.component';

@Component({
  selector: 'app-search',
  providers: [ TreeService, AuthService, SciperService, CadiService ],
  styleUrls: [ './search.style.css', '../app.style.css' ],
  templateUrl: './search.template.html'
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('myUpdateUnitComponent') myUpdateUnitComponent: UpdateUnitComponent;
  @ViewChild('myDeleteUnitComponent') myDeleteUnitComponent: DeleteUnitComponent;
  @ViewChild('myChangeDocComponent') myChangeDocComponent: ChangeDocComponent;
  
  public searchForm: FormGroup;
  public searchResults: any[];
  public selectedUnit: Unit = new Unit({});
  public selectedUnitLabels: Label[];
  public selectedUnitPlanned: UnitPlanned = new UnitPlanned({});
  public selectedUnitModel: UnitModel = new UnitModel({});
  public matchingResponsible: any;
  public matchingRoom: any;
  public unitTypesList: any[];
  public languagesList: any[];
  public labelENG: Label;
  public labelGER: Label;
  public labelITA: Label;
  public resultsPerson: any[];
  public resultsRoom: any[];
  public alerts: Array<Object> = [];
  private attributesList: any[];
  private attributeCriteriaForms: FormGroup[];
  private attributeCriterias: any[];
  private loggedUserInfo: any;
  private loggedUserInfoSubscription: Subscription;
  private dateValidationPattern: string = '^(0[1-9]|[12][0-9]|3[01])[\\.](0[1-9]|1[012])[\\.]\\d{4}$';

  public searchIsOngoing: boolean = false;
  public searchReponsibleResults: any[];
  public searchReponsibleShowResults: boolean = false;
  public searchReponsibleErrorMessage: string;
  public searchResponsibleIsOngoing: boolean = false;

  public selectedResponsible: any;

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
  *   search for a unit
  ******************************************************/
  private searchUnit(mode: string, showAlerts: boolean = true) {
    /*
    if (this.searchForm.get('sigle').value == ''
        && this.searchForm.get('label').value == ''
        && this.searchForm.get('cf').value == ''
        && this.searchForm.get('type').value == ''
        && this.searchForm.get('level').value == ''
        && (this.searchForm.get('responsibleId').value == '' || this.searchForm.get('responsibleId').value == '0')
        && this.searchForm.get('created_at_start').value == ''
        && this.searchForm.get('created_at_end').value == ''
        && this.searchForm.get('updated_at_start').value == ''
        && this.searchForm.get('updated_at_end').value == '') {
      this.alerts.push({msg: "Vous devez sélectionner au moins 1 critère", type: 'danger', closable: true});
      return;
    }
    */

    /*
    console.log("search params are: " +
      this.searchForm.get('sigle').value + ", " +
      this.searchForm.get('label').value + ", " +
      this.searchForm.get('cf').value + ", " +
      this.searchForm.get('type').value + ", " +
      this.searchForm.get('level').value + ", " +
      this.searchForm.get('created_at_start').value + ", " +
      this.searchForm.get('created_at_end').value + ", " +
      this.searchForm.get('updated_at_start').value + ", " +
      this.searchForm.get('updated_at_end').value + ", " +
      this.searchForm.get('only_permanent').value + ", " +
      this.searchForm.get('only_valid').value);
    */

    this.searchIsOngoing = true;
    
    let attributesCriterias: any[] = [];
    let criterias = <FormArray>this.searchForm.controls['attribute_criterias'];
    for (let i = 0; i < criterias.length; i++) {
      //we retrieve a formgroup
      let criteria = criterias.at(i);
      console.log("criteria " + i + " " + criteria.get('search_attribute_code').value);
      attributesCriterias.push({"code": criteria.get('search_attribute_code').value, "value": criteria.get('search_value').value});
    }
    // console.log("attributesCriterias = " + JSON.stringify(attributesCriterias));

    if (mode == "search") {
      this.treeService.searchUnits(this.searchForm.get('sigle').value,
        this.searchForm.get('label').value,
        this.searchForm.get('cf').value,
        this.searchForm.get('type').value,
        this.searchForm.get('level').value,
        this.searchForm.get('responsibleId').value,
        this.searchForm.get('created_at_start').value,
        this.searchForm.get('created_at_end').value,
        this.searchForm.get('updated_at_start').value,
        this.searchForm.get('updated_at_end').value,
        this.searchForm.get('only_permanent').value,
        this.searchForm.get('only_valid').value,
        attributesCriterias)
        .subscribe(
          (res) => this.searchResults = res,
          (error) => console.log("Error retrieving search results"),
          () => {
            if (showAlerts) {
              this.alerts.push({msg: this.searchResults.length + " résultat(s) trouvé(s)", type: 'success', closable: true});
            }
            this.searchIsOngoing = false;
          }
        );
    }
    else if (mode == "export") {
      let url: string;
      url = this.treeService.getExportUrl();
      if (this.searchForm.get('sigle').value != null) {
        url += '&sigle=' + this.searchForm.get('sigle').value;
      }
      if (this.searchForm.get('label').value != null) {
        url += '&label=' + this.searchForm.get('label').value;
      }
      if (this.searchForm.get('cf').value != null) {
        url += '&cf=' + this.searchForm.get('cf').value;
      }
      if (this.searchForm.get('type').value != null) {
        url += '&type=' + this.searchForm.get('type').value;
      }
      if (this.searchForm.get('level').value != null) {
        url += '&level=' + this.searchForm.get('level').value;
      }
      if (this.searchForm.get('responsibleId').value != null) {
        url += '&responsibleId=' + this.searchForm.get('responsibleId').value;
      }
      if (this.searchForm.get('created_at_start').value != null) {
        url += '&createdAtStart=' + this.searchForm.get('created_at_start').value;
      }
      if (this.searchForm.get('created_at_end').value != null) {
        url += '&createdAtEnd=' + this.searchForm.get('created_at_end').value;
      }
      if (this.searchForm.get('updated_at_start').value != null) {
        url += '&updatedAtStart=' + this.searchForm.get('updated_at_start').value;
      }
      if (this.searchForm.get('updated_at_end').value != null) {
        url += '&updatedAtEnd=' + this.searchForm.get('updated_at_end').value;
      }
      if (this.searchForm.get('only_valid').value) {
        url += '&onlyValid=Y';
      }
      else {
        url += '&onlyValid=N';
      }
      if (this.searchForm.get('only_permanent').value) {
        url += '&onlyPermanent=Y';
      }
      else {
        url += '&onlyPermanent=N';
      }
      if (attributesCriterias != null && attributesCriterias.length > 0) {
        let attributesCriteriasString: string = "";
        for (let criteria of attributesCriterias) {
          attributesCriteriasString += "|" + criteria.code + ":" + criteria.value;
        }
        url += '&attributes=' + attributesCriteriasString.substr(1);
      }
      
      window.location.href = url;
    }
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
  *   create or update a unit planned
  ******************************************************/
  private createOrUpdateUnitPlanned(unit: Unit) {
    this.treeService.getUnitPlannedById(unit.id)
      .subscribe(
        unitPlanned => {
          this.selectedUnitPlanned = unitPlanned;
        },
        (error) => {
          // console.log('error getting unit planned, getting unit details to build unit planned');
          this.treeService.getUnitById(unit.id)
          .subscribe(
            unitToBuildFrom => {
              //initiate a new unit planned from selected unit
              this.selectedUnitPlanned = UnitPlanned.fromUnit(unitToBuildFrom);
            },
            (error) => console.log('error getting unit'),
            () => {
              // console.log('unit planned created from unit ' + JSON.stringify(this.selectedUnitPlanned));
              this.myUpdateUnitComponent.triggerUnitPlanned(this.selectedUnitPlanned, false);
            }
          );
        },
        () => {
          this.myUpdateUnitComponent.triggerUnitPlanned(this.selectedUnitPlanned, true);
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
  *   unit has been deleted in DeleteUnitComponent
  ******************************************************/
  private unitUpdated(data: any) {
    let mode = data.mode;
    let changeLogs = data.changelogs;

    this.searchUnit("search", false);

    if (mode == 'SAVE_AND_CLOSE' && changeLogs.length > 0) {
      this.myChangeDocComponent.triggerCreateChangeDoc(JSON.stringify(changeLogs));
    }
  }

  /******************************************************
  *   unit has been deleted in DeleteUnitComponent
  ******************************************************/
  private unitDeleted(unit: Unit) {
    this.searchUnit("search", false);
  }

  /******************************************************
  *   unit planned action is finished
  ******************************************************/
  private unitPlannedDone(data: any) {
    let mode = data.mode;
    let unitPlanned = data.unitPlanned;

    this.searchUnit("search", false);

    if (mode == 'SAVE_AND_CLOSE' && unitPlanned != null) {
      this.myChangeDocComponent.triggerCreateChangeDocForUnitPlanned(unitPlanned);
    }
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
    this.searchResponsibleIsOngoing = true;
    this.sciperService.searchByName(this.searchForm.get('responsibleSearchText').value)
      .subscribe(
        (people) => {
          if (people.length == 1) {
            this.responsibleSelected(people[0]);
            this.searchReponsibleShowResults = false;
          }
          else {
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
    this.selectedResponsible = responsible;
    this.searchReponsibleResults = [];
    this.searchForm.get('responsibleSearchText').setValue('');
    this.searchForm.get('responsibleId').setValue(responsible.id);
    console.log("responsible selected " + responsible.id);
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
    this.loggedUserInfoSubscription.unsubscribe();
  }

  /******************************************************
  *   on init
  ******************************************************/
  public ngOnInit() {
    // console.log('ngOnInit `Tree` component');
    // console.log('auth_token = ' + localStorage.getItem('auth_token'));
    this.loggedUserInfo = { "username": "", "uniqueid": 0, "scopes": "read" };
    this.loggedUserInfoSubscription = this.sharedAppStateService.loggedUserInfo.subscribe((info) => this.loggedUserInfo = info);

    this.selectedUnit = new Unit({});
    this.selectedUnitLabels = [];
    this.attributeCriteriaForms = [];
    this.labelENG = new Label("{}");
    this.labelGER = new Label("{}");
    this.labelITA = new Label("{}");

    this.searchForm = this.fb.group({
      sigle: this.fb.control(''),
      label: this.fb.control(''),
      cf: this.fb.control(''),
      type: this.fb.control(''),
      level: this.fb.control(''),
      responsible: this.fb.control(''),
      responsibleId: this.fb.control(''),
      responsibleSearchText: this.fb.control(''),
      created_at_start: this.fb.control('', [Validators.pattern(this.dateValidationPattern)]),
      created_at_end: this.fb.control('', [Validators.pattern(this.dateValidationPattern)]),
      updated_at_start: this.fb.control('', [Validators.pattern(this.dateValidationPattern)]),
      updated_at_end: this.fb.control('', [Validators.pattern(this.dateValidationPattern)]),
      only_permanent: this.fb.control(''),
      only_valid: this.fb.control(''),
      attribute_criterias: this.fb.array([])
    });

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
