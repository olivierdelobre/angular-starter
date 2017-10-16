import { Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ModalDirective, TabDirective } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { TreeService } from '../services/units.service';
import { AuthService } from '../services/auth.service';
import { SciperService } from '../services/sciper.service';
import { CadiService } from '../services/cadi.service';
import { PlaceService } from '../services/place.service';
import { InfrastructureService } from '../services/infrastructure.service';
import { SharedAppStateService } from '../services/sharedappstate.service';

import { ChangeDocComponent } from '../changedoc/changedoc.component';

import { Unit } from '../model/unit.model';
import { Label } from '../model/label.model';
import { Attribute } from '../model/attribute.model';
import { ChangeLog } from '../model/changelog.model';
import { UnitType } from '../model/unittype.model';
import { UnitLang } from '../model/unitlang.model';
import { UnitModel } from '../model/unitmodel.model';
import { UnitPlanned } from '../model/unitplanned.model';
import { Address } from '../model/address.model';

import { Utils } from '../common/utils';

@Component({
  selector: 'app-updateunit',
  providers: [ TreeService, AuthService, SciperService, CadiService, PlaceService, InfrastructureService ],
  styleUrls: [ './updateunit.style.css', '../app.style.css' ],
  templateUrl: './updateunit.template.html',
  encapsulation: ViewEncapsulation.None /* required to be able to override primeNG styles */
})
export class UpdateUnitComponent implements OnInit, OnDestroy {
  @ViewChild('updateUnitModal') modal: ModalDirective;
  @ViewChild('selectRoomModal') selectRoomModal: ModalDirective;
  @ViewChild('selectResponsibleModal') selectResponsibleModal: ModalDirective;
  @ViewChild('selectCountryModal') selectCountryModal: ModalDirective;
  @ViewChild('selectLocationModal') selectLocationModal: ModalDirective;
  @ViewChild('selectParentUnitModal') selectParentUnitModal: ModalDirective;
  @ViewChild('alertsModal') alertsModal: ModalDirective;
  @ViewChild('attributeModal') attributeModal: ModalDirective;
  @ViewChild('fileUploadInput') fileUploadInput: any;
  @ViewChild('myChangeDocComponent') myChangeDocComponent: ChangeDocComponent;

  @Output() unitUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() unitPlannedDone: EventEmitter<any> = new EventEmitter<any>();
  @Output() unitModelDone: EventEmitter<UnitModel> = new EventEmitter<UnitModel>();
  @Output() messageTriggered: EventEmitter<any> = new EventEmitter<any>();
  @Output() listUnitPlanned: EventEmitter<Unit> = new EventEmitter<Unit>();
  
  public alerts: Array<string> = [];
  public showView: boolean = false;
  public root: Unit;
  public selectedUnit: Unit;
  public selectedUnitAttributes: Attribute[];
  public selectedUnitAddress: string;
  public selectedUnitAttribute: Attribute;
  public selectedUnitTypeString: string;
  public selectedUnitLangString: string;
  public selectedUnitIsTemporaryString: string;
  public selectedUnitFromString: string;
  public selectedUnitToString: string;
  public unitToDelete: Unit;
  public unitToCreateChild: Unit;
  public changeLogs: ChangeLog[];
  public unitHierarchy: any;
  public attributeTempIdCounter: number = 1000000;
  public generatedChangeLogs: any;
  public accumulatedChangeLogs: any;
  public unitForm: FormGroup;
  public attributeForm: FormGroup;
  public labelENG: Label;
  public labelDEU: Label;
  public labelITA: Label;
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public stateDate: Date = new Date();
  public stateDateTemp: Date = new Date();
  public openedIds: string;
  public onlyPermanent: boolean;
  public onlyValid: boolean;
  public expandedUnits: number[];
  public saveIsOngoing: boolean = false;
  
  public searchPersonQuery: string;  
  public searchReponsibleResults: any[];
  public searchReponsibleShowResults: boolean = false;
  public searchReponsibleErrorMessage: string;
  public searchResponsibleIsOngoing: boolean = false;
  public searchLocationResults: any[];
  public searchLocationShowResults: boolean = false;
  public searchLocationErrorMessage: string;
  public searchLocationIsOngoing: boolean = false;
  public searchCountryResults: any[];
  public searchCountryShowResults: boolean = false;
  public searchCountryErrorMessage: string;
  public searchCountrIsOngoing: boolean = false;
  public searchRoomResults: any[];
  public searchRoomShowResults: boolean = false;
  public searchRoomErrorMessage: string;
  public searchRoomIsOngoing: boolean = false;
  public searchParentUnitResults: any[];
  public searchParentUnitShowResults: boolean = false;
  public searchParentUnitErrorMessage: string;
  public searchParentUnitIsOngoing: boolean = false;

  public resultsParent: any[];
  public myunit: Unit;
  public matchingResponsible: any;
  public selectedRoom: any;
  public selectedParentUnit: any;
  public unitTypesList: UnitType[];
  public languagesList: UnitLang[];
  public attributesList: any[];
  public attributeEnumsList: any[];
  public creationMode: string = "";
  public closeModalFlag: boolean = false;
  public loggedUserInfo: any;
  public loggedUserInfoSubscription: Subscription;  
  public changeAttachmentData: FormData;
  public mode: string;
  public parentUnit: Unit;
  public unitModel: UnitModel;
  public errors: Array<Object> = [];
  public generatedId: number;  
  public selectedResponsible: any;
  public selectedLocation: any;
  public selectedCountry: any;
  public selectedUnitPlanned: UnitPlanned;
  public unitPlannedExists: boolean = false;
  public selectedUnitModel: UnitModel;
  public unitModelExists: boolean = false;
  public fromUnit: Unit;
  public showAddressTab: boolean = false;
  public unitAddress: Address;
  public labelValidationPattern: string = '^[a-zA-Zà-öù-ÿÀ-ÖØ-ß,\'\\+\\-=\\s\\d]{0,80}$';
  public sigleValidationPattern: string = '^[a-zA-Z\\-\\d]{0,12}$';
  public cfValidationPattern: string = '^[0-9]{4,5}$';
  public dateValidationPattern: string = '^(0?[1-9]|[12][0-9]|3[01])[\\.](0?[1-9]|1[012])[\\.](\\d{2}|\\d{4})$';

  constructor(public router: Router,
    public activatedRoute: ActivatedRoute,
    private treeService: TreeService,
    public fb: FormBuilder,
    public authService: AuthService,
    public sciperService: SciperService,
    public cadiService: CadiService,
    public placeService: PlaceService,
    public infrastructureService: InfrastructureService,
    public sharedAppStateService: SharedAppStateService
  ) {  }

  /******************************************************
  *   entry point for other components
  ******************************************************/
  public triggerEditUnit(unit: Unit, mode: string, resetAccumulatedChangeLogs?: boolean) {
    // console.log('editing unit: ', unit);
    this.mode = mode;
    this.changeAttachmentData = new FormData();
    this.selectedUnit = unit;
    this.errors = [];
    this.searchReponsibleResults = [];
    this.selectedResponsible = null;
    this.selectedRoom = null;
    this.selectedLocation = {};
    this.selectedCountry = {};
    this.unitHierarchy = null;
    this.closeModalFlag = false;
    this.showAddressTab = false;
    this.selectedUnitAddress = '';
    this.searchReponsibleShowResults = false;
    this.searchRoomShowResults = false;
    this.searchLocationShowResults = false;
    this.searchCountryShowResults = false;
    this.searchParentUnitShowResults = false;
    this.searchReponsibleErrorMessage = null;
    this.searchRoomErrorMessage = null;
    this.searchLocationErrorMessage = null;
    this.searchCountryErrorMessage = null;
    this.searchParentUnitErrorMessage = null;
    if (resetAccumulatedChangeLogs != null && resetAccumulatedChangeLogs) {
      this.accumulatedChangeLogs = [];
    }

    // Create a child of an existing unit, or a root unit
    if (mode == 'CREATE_CHILD' || mode == 'CREATE_ROOT') {
      this.parentUnit = unit;
      // Check if a unit model exists
      this.treeService.getUnitModelById(unit.id)
        .subscribe(
          (unitModel) => {
            this.unitModel = unitModel;
            this.buildUnitFormFromUnitModel(this.unitModel);
          },
          (error) => {
            this.unitModel = new UnitModel({});
            this.buildUnitFormFromUnitModel();
          },
          () => {}
        );
    }
    // Clone an existing unit
    else if (mode == 'CLONE') {
      this.parentUnit = unit;
      // Get the unit and use it as a model
      this.treeService.getUnitById(unit.id)
        .subscribe(
          (unitModel) => {
            this.unitModel = unitModel;
            this.buildUnitFormFromUnitModel(this.unitModel);
          },
          (error) => {
            this.unitModel = new UnitModel({});
            this.buildUnitFormFromUnitModel();
          },
          () => {}
        );
    }
    // Update an existing unit
    else if (mode == 'UPDATE') {
      // this.buildFormFromUnit(this.selectedUnit);
      this.treeService.getUnitById(unit.id)
        .subscribe(
          (unit) => {
            this.selectedUnit = unit;
            this.buildUnitFormFromUnit(this.selectedUnit);
          },
          (error) => {
            this.closeModal();
            this.messageTriggered.emit({ message: 'Impossible de récupérer les informations de l\'unité', level: 'error' });
          },
          () => {}
        );
    }
    
    this.showView = true;
    this.modal.show();
  }

  /******************************************************
  *   entry point for other components
  ******************************************************/
  public triggerUnitPlanned(unit: Unit, unitPlanned: UnitPlanned, exists: boolean) {
    // console.log('Handling unit planned form unit: ', JSON.stringify(unitPlanned));
    this.mode = 'EDIT_UNIT_PLANNED';
    this.selectedUnit = unit;
    this.selectedUnitPlanned = unitPlanned;
    this.unitPlannedExists = exists;
    this.closeModalFlag = false;
    this.selectedResponsible = null;
    this.selectedRoom = null;
    this.selectedLocation = {};
    this.selectedCountry = {};
    this.showAddressTab = false;
    this.selectedUnitAddress = '';
    this.accumulatedChangeLogs = [];

    this.buildUnitPlannedForm(this.selectedUnitPlanned);

    this.showView = true;
    this.modal.show();
  }

  /******************************************************
  *   entry point for other components
  ******************************************************/
  public triggerUnitModel(unit: UnitModel, exists: boolean) {
    // console.log('handling unit Model form unit: ', unit);
    this.mode = 'EDIT_UNIT_MODEL';
    this.selectedUnitModel = unit;
    this.unitModelExists = exists;
    this.closeModalFlag = false;
    this.selectedResponsible = null;
    this.selectedRoom = null;
    this.selectedLocation = {};
    this.selectedCountry = {};
    this.unitHierarchy = null;
    this.accumulatedChangeLogs = [];
    this.showAddressTab = false;
    this.selectedUnitAddress = '';
    this.accumulatedChangeLogs = [];

    this.buildUnitModelForm(this.selectedUnitModel);

    this.showView = true;
    this.modal.show();
  }

  /******************************************************
  *   show the attribute form panel
  ******************************************************/
  private showAttributeFormPanel(operation: string, attribute: Attribute, attributeType: any) {
    this.attributeModal.show();
    if (operation == 'update' && attribute != null) {
      // console.log('update attribute ' + attribute.id);
      this.selectedUnitAttribute = attribute;

      let fromDateString: string = '';
      if (this.selectedUnitAttribute.from != null) {
        fromDateString = moment(this.selectedUnitAttribute.from).format('DD.MM.YYYY');
      }
      let toDateString: string = '';
      if (this.selectedUnitAttribute.to != null) {
        toDateString = moment(this.selectedUnitAttribute.to).format('DD.MM.YYYY');
      }

      this.attributeForm = this.fb.group({
        code: this.fb.control(this.selectedUnitAttribute.code, Validators.required),
        text: this.fb.control(this.selectedUnitAttribute.text, Validators.required),
        textSelect: this.fb.control(this.selectedUnitAttribute.text),
        url: this.fb.control(this.selectedUnitAttribute.url),
        from: this.fb.control(fromDateString, [Validators.required, Validators.pattern(this.dateValidationPattern)]),
        to: this.fb.control(toDateString, [Validators.pattern(this.dateValidationPattern)])
      });

      // Retrieve selected attribute enums
      this.treeService.getAttributeEnums(this.selectedUnitAttribute.code)
        .subscribe(
          (list) => this.attributeEnumsList = list,
          (error) => console.log('error retrieving attribute enums'),
          () => {
            if (this.attributeEnumsList.length > 0) {
              this.attributeForm.get("textSelect").setValue(this.selectedUnitAttribute.text);
            }
          }
        );
    }
    
    if (operation == 'add') {
      // console.log('add attribute of type ' + attributeType.code);
      this.selectedUnitAttribute = new Attribute({});

      this.attributeForm = this.fb.group({
        code: this.fb.control(attributeType.code, Validators.required),
        text: this.fb.control('', Validators.required),
        textSelect: this.fb.control(''),
        url: this.fb.control(''),
        from: this.fb.control(moment().format('DD.MM.YYYY'), [Validators.required, Validators.pattern(this.dateValidationPattern)]),
        to: this.fb.control('', [Validators.pattern(this.dateValidationPattern)])
      });

      // Retrieve selected attribute enums
      this.treeService.getAttributeEnums(attributeType.code)
        .subscribe(
          (list) => this.attributeEnumsList = list,
          (error) => console.log('error retrieving attribute enums'),
          () => {
            if (this.attributeEnumsList.length > 0) {
              this.attributeForm.get("text").setValue(this.attributeEnumsList[0].value);
              this.attributeForm.get("textSelect").setValue(this.attributeEnumsList[0].value);
            }
          }
        );
    }
  }

  /******************************************************
  *   cancel changed made to an attribute and close the attribute form panel
  ******************************************************/
  private hideAttributeFormPanel() {
    this.attributeModal.hide();
    this.selectedUnitAttribute = null;
  }

  /******************************************************
  *   clear attribute "to" date
  ******************************************************/
  private clearAttributeToDate() {
    this.attributeForm.get('to').setValue('');
    this.selectedUnitAttribute.to = null;
  }

  /******************************************************
  *   save attribute (update existing or create new)
  ******************************************************/
  private saveAttribute() {
    this.selectedUnitAttribute.code = this.attributeForm.get('code').value;
    this.selectedUnitAttribute.text = this.attributeForm.get('text').value;
    this.selectedUnitAttribute.url = this.attributeForm.get('url').value;

    this.selectedUnitAttribute.from = Utils.getFormattedDate(this.attributeForm.get('from') ? this.attributeForm.get('from').value : null, this.dateValidationPattern);
    this.selectedUnitAttribute.to = Utils.getFormattedDate(this.attributeForm.get('to') ? this.attributeForm.get('to').value : null, this.dateValidationPattern);

    // If it's an update of an existing attribute
    if (this.selectedUnitAttribute.id != null) {
      // Get the attribute from unit object
      let attributeTemp: Attribute =
        this.selectedUnitAttributes.filter((aAttribute) => aAttribute.id == this.selectedUnitAttribute.id)[0];
        //this.selectedUnit.attributes.filter((aAttribute) => aAttribute.id == this.selectedUnitAttribute.id)[0];
      attributeTemp.from = this.selectedUnitAttribute.from;
      attributeTemp.to = this.selectedUnitAttribute.to;
      attributeTemp.text = this.selectedUnitAttribute.text;
      attributeTemp.lang = this.selectedUnitAttribute.lang;
      attributeTemp.url = this.selectedUnitAttribute.url;
      // console.log('Update attribute ' + JSON.stringify(attributeTemp));
    }
    else {
      this.selectedUnitAttribute.id = this.attributeTempIdCounter++;
      //this.selectedUnit.attributes.push(this.selectedUnitAttribute);
      this.selectedUnitAttributes.push(this.selectedUnitAttribute);
      // To refresh display
      //this.selectedUnit.attributes = this.selectedUnit.attributes.slice();
      this.selectedUnitAttributes = this.selectedUnitAttributes.slice();
    }

    this.attributeModal.hide();
    this.selectedUnitAttribute = null;
    //this.selectedUnitAttributes = this.selectedUnit.attributes;
  }

  /******************************************************
  *   delete a unit's attribute
  ******************************************************/
  private deleteAttribute(unit: Unit, attribute: Attribute) {
    console.log('Delete attribute ' + attribute.id);
    //this.selectedUnit.attributes = this.selectedUnit.attributes.filter((attributeTemp) => attributeTemp.id != attribute.id);
    this.selectedUnitAttributes = this.selectedUnitAttributes.filter((attributeTemp) => attributeTemp.id != attribute.id);
    this.hideAttributeFormPanel();

    //this.selectedUnitAttributes = this.selectedUnit.attributes;
  }

  /******************************************************
  *   autocomplete result for location search
  ******************************************************/
  private searchLocation() {
    if (this.unitForm.get('addressLocationText').value.length == 0) {
      return;
    }
    if (this.unitForm.get('addressLocationText').value.length < 2) {
      this.unitForm.get('addressLocationText').setErrors({ "error": true });
      this.unitForm.get('addressLocationText').markAsDirty();
      this.searchLocationErrorMessage = 'Vous devez saisir au moins 2 caractères';
      return;
    }

    this.searchLocationIsOngoing = true;
    this.placeService.searchLocation(this.unitForm.get('addressLocationText').value)
      .subscribe(
        (locations) => {
          if (locations.length == 1) {
            this.locationSelected(locations[0]);
            this.searchLocationShowResults = false;
          }
          else {
            this.selectLocationModal.show();
            this.searchLocationResults = locations;
            this.searchLocationShowResults = true;
          }
        },
        (error) => {
          console.log('Error retrieving locations from cadi service');
          this.searchLocationResults = [];
          this.searchLocationShowResults = false;
          this.searchLocationIsOngoing = false;
          this.searchLocationErrorMessage = 'Invalid search';
        },
        () => {
          this.searchLocationIsOngoing = false;
        }
    );
  }

  /******************************************************
  *   a location is selected in the autocomplete select
  ******************************************************/
  private locationSelected(location) {
    // console.log("location selected " + location.pttOrder);
    this.selectedLocation = location;
    this.searchLocationResults = [];
    this.unitForm.get('addressLocationText').setValue('');
    this.unitForm.get('addressLocationId').setValue(location.pttOrder);
    this.selectLocationModal.hide();
  }

  /******************************************************
  *   autocomplete result for country search
  ******************************************************/
  private searchCountry() {
    if (this.unitForm.get('addressCountryText').value.length == 0) {
      return;
    }
    if (this.unitForm.get('addressCountryText').value.length < 2) {
      this.unitForm.get('addressCountryText').setErrors({ "error": true });
      this.unitForm.get('addressCountryText').markAsDirty();
      this.searchCountryErrorMessage = 'Vous devez saisir au moins 2 caractères';
      return;
    }

    this.searchCountrIsOngoing = true;
    this.placeService.searchCountry(this.unitForm.get('addressCountryText').value)
      .subscribe(
        (countries) => {
          if (countries.length == 1) {
            this.countrySelected(countries[0]);
            this.searchCountryShowResults = false;
          }
          else {
            this.selectCountryModal.show();
            this.searchCountryResults = countries;
            this.searchCountryShowResults = true;
          }
        },
        (error) => {
          console.log('Error retrieving country from cadi service');
          this.searchCountryResults = [];
          this.searchCountryShowResults = false;
          this.searchCountrIsOngoing = false;
          this.searchCountryErrorMessage = 'Invalid search';
        },
        () => {
          this.searchCountrIsOngoing = false;
        }
    );
  }

  /******************************************************
  *   a country is selected in the autocomplete select
  ******************************************************/
  private countrySelected(country) {
    this.selectedCountry = country;
    this.searchCountryResults = [];
    this.searchCountryShowResults = false;
    this.unitForm.get('addressCountryText').setValue('');
    this.unitForm.get('addressCountryId').setValue(country.id);
    this.selectCountryModal.hide();
    /*
    // Blank location is selected country is CH
    if (country.codeISO != 'CH') {
      this.selectedLocation = {};
      this.unitForm.get('addressLocationText').setValue('');
      this.unitForm.get('addressLocationId').setValue(0);
    }
    */
    // console.log("country selected " + country.id);
  }

  /******************************************************
  *   clear address' selected location
  ******************************************************/
  private clearLocation() {
    this.selectedLocation = {};
    this.unitForm.get('addressLocationText').setValue('');
    this.unitForm.get('addressLocationId').setValue(0);
  }

  /******************************************************
  *   clear address' selected country
  ******************************************************/
  private clearCountry() {
    this.selectedCountry = {};
    this.unitForm.get('addressCountryText').setValue('');
    this.unitForm.get('addressCountryId').setValue(0);
  }

  /******************************************************
  *   autocomplete result for person search
  ******************************************************/
  private searchPerson(event) {
    this.sciperService.searchByName(event.query)
      .subscribe(
        (people) => this.searchReponsibleResults = people,
        (error) => console.log('Error retrieving people from sciper service')
    );
  }

  /******************************************************
  *   autocomplete result for unit responsible search
  ******************************************************/
  private searchResponsible() {
    if (this.unitForm.get('responsibleSearchText').value.length == 0) {
      return;
    }
    if (this.unitForm.get('responsibleSearchText').value.length < 3) {
      this.unitForm.get('responsibleSearchText').setErrors({ "error": true });
      this.unitForm.get('responsibleSearchText').markAsDirty();
      this.searchReponsibleErrorMessage = 'Vous devez saisir au moins 3 caractères';
      return;
    }

    this.searchResponsibleIsOngoing = true;
    this.sciperService.searchByName(this.unitForm.get('responsibleSearchText').value)
      .subscribe(
        (people) => {
          if (people.length == 1) {
            this.responsibleSelected(people[0]);
            this.searchReponsibleShowResults = false;
          }
          else {
            this.selectResponsibleModal.show();
            this.searchReponsibleResults = people;
            this.searchReponsibleShowResults = true;
          }
        },
        (error) => {
          console.log('Error retrieving people from sciper service');
          this.searchReponsibleResults = [];
          this.searchReponsibleShowResults = false;
          this.searchResponsibleIsOngoing = false;
          this.searchReponsibleErrorMessage = 'Invalid search';
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
    this.unitForm.get('responsibleSearchText').setValue('');
    this.unitForm.get('responsible').setValue('');
    this.unitForm.get('responsibleId').setValue(0);
  }

  /******************************************************
  *   a person is selected in the autocomplete select
  ******************************************************/
  private personSelected(event) {
    this.unitForm.get('responsibleId').setValue(event.id);
    console.log("person selected " + event.id);
  }

  private responsibleSelected(responsible) {
    console.log("responsible selected " + responsible.id);
    this.selectedResponsible = responsible;
    this.searchReponsibleResults = [];
    this.unitForm.get('responsibleSearchText').setValue('');
    this.unitForm.get('responsibleId').setValue(responsible.id);
    this.selectResponsibleModal.hide();
  }

  /******************************************************
  *   autocomplete result for parent search
  ******************************************************/
  private searchParentUnit(event) {
    if (this.unitForm.get('parentUnitSearchText').value.length == 0) {
      return;
    }
    if (this.unitForm.get('parentUnitSearchText').value.length < 3) {
      this.unitForm.get('parentUnitSearchText').setErrors({ "error": true });
      this.unitForm.get('parentUnitSearchText').markAsDirty();
      this.searchParentUnitErrorMessage = 'Vous devez saisir au moins 3 caractères';
      return;
    }

    this.searchParentUnitIsOngoing = true;
    this.treeService.searchUnitsGeneric('%25' + this.unitForm.get('parentUnitSearchText').value + '%25', this.selectedUnit.level - 1)
      .subscribe(
        (units) => {
          if (units.length == 1) {
            this.parentUnitSelected(units[0]);
            this.searchParentUnitShowResults = false;
          }
          else {
            this.selectParentUnitModal.show();
            this.searchParentUnitResults = units;
            this.searchParentUnitShowResults = true;
          }
        },
        (error) => {
          console.log('Error retrieving units from Units service');
          this.searchParentUnitResults = [];
          this.searchParentUnitShowResults = false;
          this.searchParentUnitIsOngoing = false;
          this.searchParentUnitErrorMessage = 'Invalid search';
        },
        () => {
          this.searchParentUnitIsOngoing = false;
          this.searchParentUnitErrorMessage = null;
        }
    );
  }

  /******************************************************
  *   a parent is selected in the autocomplete select
  ******************************************************/
  private parentUnitSelected(unit) {
    console.log("Parent Unit selected " + unit.id);
    this.selectedParentUnit = unit;
    this.searchParentUnitResults = [];
    this.unitForm.get('parentUnitSearchText').setValue('');
    this.unitForm.get('parentId').setValue(unit.id);
    this.selectParentUnitModal.hide();
  }

  /******************************************************
  *   clear parent in form
  ******************************************************/
  private clearParent() {
    //this.unitForm.get('parent').setValue('');
    this.unitForm.get('parentId').setValue(0);
  }

  /******************************************************
  *   autocomplete result for room search
  ******************************************************/
  private searchRoom() {
    if (this.unitForm.get('roomSearchText').value.length == 0) {
      return;
    }
    if (this.unitForm.get('roomSearchText').value.length < 2) {
      this.unitForm.get('roomSearchText').setErrors({ "error": true });
      this.unitForm.get('roomSearchText').markAsDirty();
      this.searchRoomErrorMessage = 'Vous devez saisir au moins 2 caractères';
      return;
    }

    this.searchRoomIsOngoing = true;
    this.infrastructureService.searchRoomsByLabel(this.unitForm.get('roomSearchText').value)
      .subscribe(
        (rooms) => {
          if (rooms.length == 1) {
            this.roomSelected(rooms[0]);
          }
          else {
            this.selectRoomModal.show();
            this.searchRoomResults = rooms;
            this.searchRoomShowResults = true;
          }
        },
        (error) => {
          console.log('Error retrieving rooms from infrastructure service');
          this.searchRoomResults = [];
          this.searchRoomShowResults = false;
          this.searchRoomIsOngoing = false;
          this.searchRoomErrorMessage = 'Invalid search';
        },
        () => {
          this.searchRoomIsOngoing = false;
          this.searchRoomErrorMessage = null;
        }
    );
  }

  /******************************************************
  *   clear room in form
  ******************************************************/
  private clearRoom() {
    this.unitForm.get('room').setValue('');
    this.unitForm.get('roomId').setValue(0);
    this.selectedRoom = null;
    this.showAddressTab = true;
  }

  /******************************************************
  *   a room is selected in the autocomplete select
  ******************************************************/
  private roomSelected(room) {
    this.selectedRoom = room;
    this.searchRoomResults = [];
    this.searchRoomShowResults = false;
    this.unitForm.get('roomSearchText').setValue('');
    this.unitForm.get('roomId').setValue(room.id);
    console.log("room selected " + room.id);
    this.showAddressTab = false;
    this.selectRoomModal.hide();
  }

  /******************************************************
  *   build the update unit form
  ******************************************************/
  private buildUnitFormFromUnit(unit: Unit) {
    if (unit != null && unit.roomId == null) {
      this.showAddressTab = true;
    }

    // Reset labels
    this.labelENG = new Label("{}");
    this.labelDEU = new Label("{}");
    this.labelITA = new Label("{}");

    if (this.selectedUnit.labels != null) {
      for (let label of this.selectedUnit.labels) {
        if (label.lang == 'ENG') {
          this.labelENG = label;
        }
        if (label.lang == 'DEU') {
          this.labelDEU = label;
        }
        if (label.lang == 'ITA') {
          this.labelITA = label;
        }
      }
    }

    this.unitAddress = new Address("{}");
    if (this.selectedUnit.address != null) {
      this.unitAddress = this.selectedUnit.address;
    }

    // Build form
    this.unitForm = this.fb.group({
      label: this.fb.control(unit.label, [Validators.required, Validators.pattern(this.labelValidationPattern)]),
      sigle: this.fb.control(unit.sigle, [Validators.required, Validators.pattern(this.sigleValidationPattern)]),
      labelShort: this.fb.control(unit.labelShort, [Validators.required, Validators.maxLength(40)]),
      type: this.fb.control(unit.type),
      lang: this.fb.control(unit.lang),
      cfNumber: this.fb.control({ value: unit.cfNumber, disabled: true }, Validators.required),
      cf: this.fb.control(unit.cf, [Validators.pattern(this.cfValidationPattern)]),
      from: this.fb.control(unit.from == null ? '':moment(unit.from).format('DD.MM.YYYY'), [Validators.required, Validators.pattern(this.dateValidationPattern)]),
      to: this.fb.control(unit.to == null ? '':moment(unit.to).format('DD.MM.YYYY'), [Validators.pattern(this.dateValidationPattern)]),
      responsible: this.fb.control(''),
      responsibleId: this.fb.control(unit.responsibleId),
      responsibleSearchText: this.fb.control(''),
      position: this.fb.control(unit.position),
      parentId: this.fb.control(unit.parentId, Validators.required),
      parentUnitSearchText: this.fb.control(''),
      room: this.fb.control(''),
      roomId: this.fb.control(unit.roomId),
      roomSearchText: this.fb.control(''),
      isTemporary: this.fb.control(unit.isTemporary),
      sigleEn: this.fb.control(this.labelENG.sigle),
      sigleGe: this.fb.control(this.labelDEU.sigle),
      sigleIt: this.fb.control(this.labelITA.sigle),
      labelEn: this.fb.control(this.labelENG.label),
      labelGe: this.fb.control(this.labelDEU.label),
      labelIt: this.fb.control(this.labelITA.label),
      labelShortEn: this.fb.control(this.labelENG.labelShort),
      labelShortGe: this.fb.control(this.labelDEU.labelShort),
      labelShortIt: this.fb.control(this.labelITA.labelShort),
      address1: this.fb.control(this.unitAddress.address1),
      address2: this.fb.control(this.unitAddress.address2),
      address3: this.fb.control(this.unitAddress.address3),
      address4: this.fb.control(this.unitAddress.address4),
      addressLocationText: this.fb.control(''),
      addressLocationId: this.fb.control(''),
      addressCountryText: this.fb.control(''),
      addressCountryId: this.fb.control('')
    });

    // Retrieve responsible from sciper service
    if (unit.responsibleId != null) {
      this.refreshResponsibleSelected(unit.responsibleId);
    }

    // Retrieve room from cadi service
    if (unit.roomId != null) {
      this.refreshRoomSelected(unit.roomId);
    }

    // Retrieve location from cadi service
    if (unit.address != null && unit.address.pttOrder != null) {
      this.refreshLocationSelected(unit.address.pttOrder);
    }

    // Retrieve country from cadi service
    if (unit.address != null && unit.address.countryId != null) {
      this.refreshCountrySelected(unit.address.countryId);
    }

    // Retrieve parent unit
    if (unit.parentId != null && unit.parentId != 0) {
      this.refreshParentUnitSelected(unit.parentId);
    }
    else {
      this.selectedParentUnit = null;
    }

    // Retrieve unit hierarchy
    this.treeService.getUnitHierarchy(unit.id)
      .subscribe(
        (hierarchy) => {
          this.unitHierarchy = hierarchy;
        },
        (error) => {
          console.log('Unable to retrieve unit hierarchy');
        },
        () => {
          // Retrieve UnitAttributes and pass the root of it, to determine
          // if it's in the ENTREPRISES branch or not
          let rootUnitSigle: string = '';
          if (this.unitHierarchy != null && this.unitHierarchy.sigle != '[racine]') {
            rootUnitSigle = this.unitHierarchy.sigle;
          }
          this.treeService.getAttributes(rootUnitSigle)
            .subscribe(
              (list) => {
                this.attributesList = list;
              },
              (error) => { console.log('error getting unit attributes'); },
              () => { }
            );
        }
      );

    this.selectedUnitAttributes = unit.attributes;
    this.generateUnitAddress(this.selectedUnit);

    // Retrieve unit change logs
    this.treeService.getUnitChangeLogs(unit.id)
      .subscribe(
        (logs) => {
          this.changeLogs = logs;
        },
        (error) => console.log('error retrieving unit change logs'),
        () => { }
      );
    
    let filteredUnitTypes : Array<UnitType> = this.unitTypesList.filter((unitType) => unitType.code == this.selectedUnit.type);
    if (filteredUnitTypes.length > 0) {
      this.selectedUnitTypeString = filteredUnitTypes[0].label;
    }
    let filteredUnitLangs : Array<UnitType> = this.languagesList.filter((lang) => lang.code == this.selectedUnit.lang);
    if (filteredUnitLangs.length > 0) {
      this.selectedUnitLangString = filteredUnitLangs[0].label;
    }
    this.selectedUnit.isTemporary == true ? this.selectedUnitIsTemporaryString = "Oui" : this.selectedUnitIsTemporaryString = "Non";
    if (this.selectedUnit.from != null) {
      this.selectedUnitFromString = this.selectedUnit.from.substr(8, 2) + '/'
        + this.selectedUnit.from.substr(5, 2) + '/'
        + this.selectedUnit.from.substr(0, 4);
    }
    if (this.selectedUnit.to != null) {
      this.selectedUnitToString = this.selectedUnit.to.substr(8, 2) + '/'
        + this.selectedUnit.to.substr(5, 2) + '/'
        + this.selectedUnit.to.substr(0, 4);
    }
  }

  /******************************************************
  *   build the create unit form from UnitModel
  ******************************************************/
  private buildUnitFormFromUnitModel(unitModel?: UnitModel) {
    if (unitModel == null || unitModel.roomId == null) {
      this.showAddressTab = true;
    }

    if (unitModel) {
      //reset labels
      this.labelENG = new Label("{}");
      this.labelDEU = new Label("{}");
      this.labelITA = new Label("{}");

      if (unitModel.labels != null) {
        for (let label of unitModel.labels) {
          if (label.lang == 'ENG') {
            this.labelENG = label;
          }
          if (label.lang == 'DEU') {
            this.labelDEU = label;
          }
          if (label.lang == 'ITA') {
            this.labelITA = label;
          }
        }
      }

      this.unitAddress = new Address("{}");
      if (unitModel != null && unitModel.address != null) {
        this.unitAddress = unitModel.address;
      }

      this.unitForm = this.fb.group({
        label: this.fb.control(unitModel.label, [Validators.required, Validators.pattern(this.labelValidationPattern)]),
        sigle: this.fb.control(unitModel.sigle, [Validators.required, Validators.pattern(this.sigleValidationPattern)]),
        labelShort: this.fb.control(unitModel.labelShort, [Validators.required, Validators.maxLength(40)]),
        type: this.fb.control(unitModel.type),
        lang: this.fb.control(unitModel.lang),
        cfNumber: this.fb.control({ value: unitModel.cfNumber, disabled: true }, Validators.required),
        cf: this.fb.control(unitModel.cf, [Validators.pattern(this.cfValidationPattern)]),
        from: this.fb.control(unitModel.from == null ? '':moment(unitModel.from).format('DD.MM.YYYY'), [Validators.required, Validators.pattern(this.dateValidationPattern)]),
        to: this.fb.control(unitModel.to == null ? '':moment(unitModel.to).format('DD.MM.YYYY'), [Validators.pattern(this.dateValidationPattern)]),
        responsible: this.fb.control(''),
        responsibleId: this.fb.control(unitModel.responsibleId),
        responsibleSearchText: this.fb.control(''),
        position: this.fb.control(unitModel.position),
        isTemporary: this.fb.control(unitModel.isTemporary),
        order: this.fb.control(''),
        room: this.fb.control(''),
        roomId: this.fb.control(unitModel.roomId),
        roomSearchText: this.fb.control(''),
        parentId: this.fb.control(unitModel.parentId),
        parentUnitSearchText: this.fb.control(''),
        sigleEn: this.fb.control(this.labelENG.sigle),
        sigleGe: this.fb.control(this.labelDEU.sigle),
        sigleIt: this.fb.control(this.labelITA.sigle),
        labelEn: this.fb.control(this.labelENG.label),
        labelGe: this.fb.control(this.labelDEU.label),
        labelIt: this.fb.control(this.labelITA.label),
        labelShortEn: this.fb.control(this.labelENG.labelShort),
        labelShortGe: this.fb.control(this.labelDEU.labelShort),
        labelShortIt: this.fb.control(this.labelITA.labelShort),
        address1: this.fb.control(this.unitAddress.address1),
        address2: this.fb.control(this.unitAddress.address2),
        address3: this.fb.control(this.unitAddress.address3),
        address4: this.fb.control(this.unitAddress.address4),
        addressLocationText: this.fb.control(''),
        addressLocationId: this.fb.control(''),
        addressCountryText: this.fb.control(''),
        addressCountryId: this.fb.control('')
      });

      //retrieve responsible from sciper service
      if (unitModel.responsibleId != null && unitModel.responsibleId != 0) {
        this.refreshResponsibleSelected(unitModel.responsibleId);
      }

      //retrieve room from cadi service
      if (unitModel.roomId != null && unitModel.roomId != 0) {
        this.refreshRoomSelected(unitModel.roomId);
      }

      // Retrieve parent unit
      this.selectedParentUnit = null;
      if (unitModel.parentId != null && unitModel.parentId != 0) {
        this.refreshParentUnitSelected(unitModel.parentId);
      }

      //retrieve attributes from unit service
      this.selectedUnitAttributes = unitModel.attributes;
    }
    else {
      this.unitForm = this.fb.group({
        label: this.fb.control('', [Validators.required, Validators.pattern(this.labelValidationPattern)]),
        sigle: this.fb.control('', [Validators.required, Validators.pattern(this.sigleValidationPattern)]),
        labelShort: this.fb.control('', [Validators.required, Validators.maxLength(40)]),
        type: this.fb.control(''),
        lang: this.fb.control('FRA'),
        cfNumber: this.fb.control({ value: '', disabled: true }, Validators.required),
        cf: this.fb.control('', [Validators.pattern(this.cfValidationPattern)]),
        from: this.fb.control('', [Validators.required, Validators.pattern(this.dateValidationPattern)]),
        to: this.fb.control('', [Validators.pattern(this.dateValidationPattern)]),
        responsible: this.fb.control(''),
        responsibleId: this.fb.control(''),
        responsibleSearchText: this.fb.control(''),
        position: this.fb.control(''),
        isTemporary: this.fb.control(true),
        order: this.fb.control(''),
        room: this.fb.control(''),
        roomId: this.fb.control(''),
        roomSearchText: this.fb.control(''),
        parentId: this.fb.control(''),
        parentUnitSearchText: this.fb.control(''),
        sigleEn: this.fb.control(''),
        sigleGe: this.fb.control(''),
        sigleIt: this.fb.control(''),
        labelEn: this.fb.control(''),
        labelGe: this.fb.control(''),
        labelIt: this.fb.control(''),
        labelShortEn: this.fb.control(''),
        labelShortGe: this.fb.control(''),
        labelShortIt: this.fb.control(''),
        address1: this.fb.control(''),
        address2: this.fb.control(''),
        address3: this.fb.control(''),
        address4: this.fb.control(''),
        addressLocationText: this.fb.control(''),
        addressLocationId: this.fb.control(''),
        addressCountryText: this.fb.control(''),
        addressCountryId: this.fb.control('')
      });

      this.selectedUnitAttributes = [];
    }

    // If no model existed, then init the address form with address from level 1 unit
    this.treeService.getUnitHierarchy(this.parentUnit.id)
      .subscribe(
        (hierarchy) => {
          // get Unit data for the level 1 unit in hierarchy
          this.treeService.getUnitById(hierarchy.id)
            .subscribe(
              (unit) => {
                this.refreshAddressForm(unit);
              },
              (error) => { },
              () => { }
            );
        },
        (error) => { },
        () => { }
      );

    // Retrieve parent unit
    this.selectedParentUnit = null;
    if (this.parentUnit.id != null && this.parentUnit.id != 0) {
      this.refreshParentUnitSelected(this.parentUnit.id);
    }

    // Retrieve unit hierarchy
    this.treeService.getUnitHierarchy(this.parentUnit.id)
      .subscribe(
        (hierarchy) => {
          this.unitHierarchy = hierarchy;
        },
        (error) => {
          console.log('Unable to retrieve unit hierarchy');
        },
        () => {
          // Retrieve UnitAttributes and pass the root of it, to determine
          // if it's in the ENTREPRISES branch or not
          let rootUnitSigle: string = '';
          // console.log('this.unitHierarchy = ' + JSON.stringify(this.unitHierarchy));
          if (this.unitHierarchy != null && this.unitHierarchy.sigle != '[racine]') {
            rootUnitSigle = this.unitHierarchy.sigle;
          }
          this.treeService.getAttributes(rootUnitSigle)
            .subscribe(
              (list) => {
                this.attributesList = list;
              },
              (error) => { console.log('error getting unit attributes'); },
              () => { }
            );
        }
      );

    if (unitModel != null) {
      this.generateUnitAddress(unitModel);
    }
  }

  /******************************************************
  *   build the update UnitPlanned form
  ******************************************************/
  private buildUnitPlannedForm(unit: UnitPlanned) {
    if (unit && unit.roomId == null) {
      this.showAddressTab = true;
    }
    
    // reset labels
    this.labelENG = new Label("{}");
    this.labelDEU = new Label("{}");
    this.labelITA = new Label("{}");

    if (this.selectedUnitPlanned.labels != null) {
      for (let label of this.selectedUnitPlanned.labels) {
        if (label.lang == 'ENG') {
          this.labelENG = label;
        }
        if (label.lang == 'DEU') {
          this.labelDEU = label;
        }
        if (label.lang == 'ITA') {
          this.labelITA = label;
        }
      }
    }

    this.unitAddress = new Address("{}");
    if (unit.address != null) {
      this.unitAddress = unit.address;
    }

    // build form
    this.unitForm = this.fb.group({
      label: this.fb.control(unit.label, [Validators.required, Validators.pattern(this.labelValidationPattern)]),
      sigle: this.fb.control(unit.sigle, [Validators.required, Validators.pattern(this.sigleValidationPattern)]),
      labelShort: this.fb.control(unit.labelShort, [Validators.required, Validators.maxLength(40)]),
      type: this.fb.control(unit.type),
      lang: this.fb.control(unit.lang),
      cfNumber: this.fb.control({ value: unit.cfNumber, disabled: true }, Validators.required),
      cf: this.fb.control(unit.cf, [Validators.pattern(this.cfValidationPattern)]),
      from: this.fb.control(unit.from == null ? '':moment(unit.from).format('DD.MM.YYYY'), [Validators.required, Validators.pattern(this.dateValidationPattern)]),
      to: this.fb.control(unit.to == null ? '':moment(unit.to).format('DD.MM.YYYY'), [Validators.pattern(this.dateValidationPattern)]),
      responsible: this.fb.control(''),
      responsibleId: this.fb.control(unit.responsibleId),
      responsibleSearchText: this.fb.control(''),
      position: this.fb.control(unit.position),
      room: this.fb.control(''),
      roomId: this.fb.control(unit.roomId),
      roomSearchText: this.fb.control(''),
      parentId: this.fb.control(unit.parentId),
      parentUnitSearchText: this.fb.control(''),
      isTemporary: this.fb.control(unit.isTemporary),
      applyAt: this.fb.control(unit.applyAt == null ? '':moment(unit.applyAt).format('DD.MM.YYYY'), [Validators.required, Validators.pattern(this.dateValidationPattern)]),
      sigleEn: this.fb.control(this.labelENG.sigle),
      sigleGe: this.fb.control(this.labelDEU.sigle),
      sigleIt: this.fb.control(this.labelITA.sigle),
      labelEn: this.fb.control(this.labelENG.label),
      labelGe: this.fb.control(this.labelDEU.label),
      labelIt: this.fb.control(this.labelITA.label),
      labelShortEn: this.fb.control(this.labelENG.labelShort),
      labelShortGe: this.fb.control(this.labelDEU.labelShort),
      labelShortIt: this.fb.control(this.labelITA.labelShort),
      address1: this.fb.control(this.unitAddress.address1),
      address2: this.fb.control(this.unitAddress.address2),
      address3: this.fb.control(this.unitAddress.address3),
      address4: this.fb.control(this.unitAddress.address4),
      addressLocationText: this.fb.control(''),
      addressLocationId: this.fb.control(''),
      addressCountryText: this.fb.control(''),
      addressCountryId: this.fb.control('')
    });

    // retrieve responsible from sciper service
    if (unit.responsibleId != null && unit.responsibleId != 0) {
      this.refreshResponsibleSelected(unit.responsibleId);
    }

    // retrieve room from cadi service
    if (unit.roomId != null && unit.roomId != 0) {
      this.refreshRoomSelected(unit.roomId);
    }

    // retrieve attributes from unit service
    this.selectedUnitAttributes = unit.attributes;

    // Retrieve location from cadi service
    if (unit.address != null && unit.address.pttOrder != null) {
      this.refreshLocationSelected(unit.address.pttOrder);
    }

    // Retrieve country from cadi service
    if (unit.address != null && unit.address.countryId != null) {
      this.refreshCountrySelected(unit.address.countryId);
    }

    // Retrieve unit hierarchy
    this.treeService.getUnitHierarchy(unit.unitId)
      .subscribe(
        (hierarchy) => {
          this.unitHierarchy = hierarchy;
        },
        (error) => {
          console.log('Unable to retrieve unit hierarchy');
        },
        () => {
          // Retrieve UnitAttributes and pass the root of it, to determine
          // if it's in the ENTREPRISES branch or not
          let rootUnitSigle: string = '';
          // console.log('this.unitHierarchy = ' + JSON.stringify(this.unitHierarchy));
          if (this.unitHierarchy != null && this.unitHierarchy.sigle != '[racine]') {
            rootUnitSigle = this.unitHierarchy.sigle;
          }
          this.treeService.getAttributes(rootUnitSigle)
            .subscribe(
              (list) => {
                this.attributesList = list;
              },
              (error) => { console.log('error getting unit attributes'); },
              () => { }
            );
        }
      );
    
    // Retrieve parent unit
    if (unit.parentId != null && unit.parentId != 0) {
      this.refreshParentUnitSelected(unit.parentId);
    }

    this.generateUnitAddress(unit);
  }

  /******************************************************
  *   build the update unit form
  ******************************************************/
  private buildUnitModelForm(unit: UnitModel) {
    if (unit && unit.roomId == null) {
      this.showAddressTab = true;
    }
    
    // reset labels
    this.labelENG = new Label("{}");
    this.labelDEU = new Label("{}");
    this.labelITA = new Label("{}");

    if (this.selectedUnitModel.labels != null) {
      for (let label of this.selectedUnitModel.labels) {
        if (label.lang == 'ENG') {
          this.labelENG = label;
        }
        if (label.lang == 'DEU') {
          this.labelDEU = label;
        }
        if (label.lang == 'ITA') {
          this.labelITA = label;
        }
      }
    }

    // build form
    this.unitForm = this.fb.group({
      label: this.fb.control(unit.label, [Validators.pattern(this.labelValidationPattern)]),
      sigle: this.fb.control(unit.sigle, [Validators.pattern(this.sigleValidationPattern)]),
      labelShort: this.fb.control(unit.labelShort, [Validators.maxLength(40)]),
      type: this.fb.control(unit.type),
      lang: this.fb.control(unit.lang),
      cfNumber: this.fb.control({ value: unit.cfNumber, disabled: true }),
      cf: this.fb.control(unit.cf, [Validators.pattern(this.cfValidationPattern)]),
      from: this.fb.control(unit.from == null ? '':moment(unit.from).format('DD.MM.YYYY'), [Validators.pattern(this.dateValidationPattern)]),
      to: this.fb.control(unit.to == null ? '':moment(unit.to).format('DD.MM.YYYY'), [Validators.pattern(this.dateValidationPattern)]),
      responsible: this.fb.control(''),
      responsibleId: this.fb.control(unit.responsibleId),
      responsibleSearchText: this.fb.control(''),
      position: this.fb.control(unit.position),
      room: this.fb.control(''),
      roomId: this.fb.control(unit.roomId),
      roomSearchText: this.fb.control(''),
      parentId: this.fb.control(unit.parentId),
      parentUnitSearchText: this.fb.control(''),
      isTemporary: this.fb.control(unit.isTemporary),
      sigleEn: this.fb.control(this.labelENG.sigle),
      sigleGe: this.fb.control(this.labelDEU.sigle),
      sigleIt: this.fb.control(this.labelITA.sigle),
      labelEn: this.fb.control(this.labelENG.label),
      labelGe: this.fb.control(this.labelDEU.label),
      labelIt: this.fb.control(this.labelITA.label),
      labelShortEn: this.fb.control(this.labelENG.labelShort),
      labelShortGe: this.fb.control(this.labelDEU.labelShort),
      labelShortIt: this.fb.control(this.labelITA.labelShort),
      address1: this.fb.control(''),
      address2: this.fb.control(''),
      address3: this.fb.control(''),
      address4: this.fb.control(''),
      addressLocationText: this.fb.control(''),
      addressLocationId: this.fb.control(''),
      addressCountryText: this.fb.control(''),
      addressCountryId: this.fb.control('')
    });

    // retrieve responsible from sciper service
    if (unit.responsibleId != null && unit.responsibleId != 0) {
      this.refreshResponsibleSelected(unit.responsibleId);
    }

    // retrieve room from cadi service
    if (unit.roomId != null && unit.roomId != 0) {
      this.refreshRoomSelected(unit.roomId);
    }

    // Retrieve unit on which is based the model
    this.treeService.getUnitById(unit.id)
      .subscribe(
        (unit) => {
          this.fromUnit = unit;
        },
        (error) => {
          console.log('Unable to unit from');
        },
        () => { }
      );
    
    // Retrieve unit hierarchy
    this.treeService.getUnitHierarchy(unit.id)
      .subscribe(
        (hierarchy) => {
          this.unitHierarchy = hierarchy;
        },
        (error) => {
          console.log('Unable to retrieve unit hierarchy');
        },
        () => {
          // Retrieve UnitAttributes and pass the root of it, to determine
          // if it's in the ENTREPRISES branch or not
          let rootUnitSigle: string = '';
          if (this.unitHierarchy != null && this.unitHierarchy.sigle != '[racine]') {
            rootUnitSigle = this.unitHierarchy.sigle;
          }
          this.treeService.getAttributes(rootUnitSigle)
            .subscribe(
              (list) => {
                this.attributesList = list;
              },
              (error) => { console.log('error getting unit attributes'); },
              () => { }
            );
        }
      );

    // retrieve attributes from unit service
    this.selectedUnitAttributes = unit.attributes;
  }


  /******************************************************
  *   check submitted unit consistency before saving it
  ******************************************************/
  private checkUnit(unit: any) {
    this.alerts = [];
    let observables: Observable<any>[] = [];
    let observableRoomIsSet: boolean = false;
    let observableResponsibleIsSet: boolean = false;
    let observableParentUnitIsSet: boolean = false;
    let observableUnitPlannedIsSet: boolean = false;

    // console.log('Checking unit: ', JSON.stringify(unit));

    if ((unit.roomId == null || unit.roomId == 0) && this.unitForm.get('roomSearchText').value != '') {
      observableRoomIsSet = true;
      observables.push(this.infrastructureService.searchRoomsByLabel(this.unitForm.get('roomSearchText').value));
    }
    if ((unit.responsibleId == null || unit.responsibleId == 0) && this.unitForm.get('responsibleSearchText').value != '') {
      observableResponsibleIsSet = true;
      observables.push(this.sciperService.searchByName(this.unitForm.get('responsibleSearchText').value));
    }
    if (this.mode == 'EDIT_UNIT_PLANNED') {
      observableUnitPlannedIsSet = true;
      observables.push(this.treeService.getUnitPlannedsForUnitId(this.selectedUnit.id));
    }
    if (this.mode != 'EDIT_UNIT_MODEL' && this.unitForm.get('parentUnitSearchText').value != '') {
      observableParentUnitIsSet = true;
      observables.push(this.treeService.searchUnitsGeneric('%25' + this.unitForm.get('parentUnitSearchText').value + '%25', this.selectedUnit.level - 1));
    }
    observables.push(this.treeService.searchUnits(unit.sigle, '', '', '', '', '', 0, '', '', '', '', null, null, []));
    observables.push(this.treeService.searchUnits('', '', '', unit.cf, '', '', 0, '', '', '', '', null, null, []));
    observables.push(this.treeService.searchUnits('', unit.label, '', '', '', '', 0, '', '', '', '', null, null, []));
    observables.push(this.treeService.searchUnits('', '', unit.labelShort, '', '', '', 0, '', '', '', '', null, null, []));

    Observable.forkJoin(observables)
      .subscribe((dataArray) => {
        let roomIsOk: boolean = true;
        let responsibleIsOk: boolean = true;
        let sigleIsOk: boolean = true;
        let cfIsOk: boolean = true;
        let unitFromIsOk: boolean = true;
        let unitToIsOk: boolean = true;
        let unitFromToConsistencyIsOk: boolean = true;
        let unitApplyAtIsOk: boolean = true;
        let unitPlannedApplyAtIsOk: boolean = true;
        let parentUnitIsOk: boolean = true;
        let labelIsOk: boolean = true;
        let labelShortIsOk: boolean = true;
        
        let idx = 0;

        // Room
        if (observableRoomIsSet) {
          // If search returned a unique result, then fix it in the unit
          if (dataArray[idx].length == 1) {
            unit.roomId = dataArray[idx][0].id;
          }
          else {
            roomIsOk = false;
            this.unitForm.get('roomSearchText').setErrors({ "error": true });
            this.unitForm.get('roomSearchText').markAsDirty();
            this.alerts.push("Aucun bureau ou résultat non-unique trouvé pour " + this.unitForm.get('roomSearchText').value);
          }
          idx++;
        }

        // Responsible
        if (observableResponsibleIsSet) {
          // If search returned a unique result, then fix it in the unit
          if (dataArray[idx].length == 1) {
            unit.responsibleId = dataArray[idx][0].id;
          }
          else {
            responsibleIsOk = false;
            this.unitForm.get('responsibleSearchText').setErrors({ "error": true });
            this.unitForm.get('responsibleSearchText').markAsDirty();
            this.alerts.push("Aucun responsable ou résultat non-unique trouvé pour " + this.unitForm.get('responsibleSearchText').value);
          }
          idx++;
        }

        // Check that no UnitPlanned already exists for this applyAt date
        if (observableUnitPlannedIsSet) {
          for (let unitPlannedLoop of dataArray[idx]) {
            if (moment(unitPlannedLoop.applyAt).format('DD.MM.YYYY') == unit.applyAt && (this.selectedUnitPlanned.id == null || (unitPlannedLoop.id != this.selectedUnitPlanned.id))) {
              unitPlannedApplyAtIsOk = false;
              this.unitForm.get('applyAt').setErrors({ "error": true });
              this.unitForm.get('applyAt').markAsDirty();
              this.alerts.push("Une version planifiée avec cette date d'application existe déjà");
            }
          }
          idx++;
        }

        // Parent Unit
        if (observableParentUnitIsSet) {
          // If search returned a unique result, then fix it in the unit
          if (dataArray[idx].length == 1) {
            unit.parentId = dataArray[idx][0].id;
          }
          else {
            parentUnitIsOk = false;
            this.unitForm.get('parentUnitSearchText').setErrors({ "error": true });
            this.unitForm.get('parentUnitSearchText').markAsDirty();
            this.alerts.push("Aucune unité mère ou résultat non-unique trouvé pour " + this.unitForm.get('parentUnitSearchText').value);
          }
          idx++;
        }

        // Unit sigle
        // Error if an other unit has the same sigle
        // console.log("this.selectedUnitPlanned.unitId = " + this.selectedUnitPlanned.unitId);
        for (let unitLoop of dataArray[idx]) {
          if (unitLoop.sigle == unit.sigle.toUpperCase()) {
            // If create mode
            if (this.mode == 'CREATE_CHILD' || this.mode == 'CREATE_ROOT' || this.mode == 'CLONE') {
              sigleIsOk = false;
            }
            // If updating Unit
            else if (this.mode == 'UPDATE' && (unitLoop.id != this.selectedUnit.id && unitLoop.clonedFromId != this.selectedUnit.id)) {
              sigleIsOk = false;
            }
            // If updating UnitPlanned
            else if (this.mode == 'EDIT_UNIT_PLANNED' && (unitLoop.id != this.selectedUnitPlanned.unitId && unitLoop.clonedFromId != this.selectedUnitPlanned.unitId)) {
              console.log('unitLoop.id = ' + unitLoop.id);
              console.log('this.selectedUnitPlanned.unitId = ' + this.selectedUnitPlanned.unitId);
              console.log('unitLoop.clonedFromId = ' + unitLoop.clonedFromId);
              sigleIsOk = false;
            }

            if (!sigleIsOk) {
              this.unitForm.get('sigle').setErrors({ "error": true });
              this.unitForm.get('sigle').markAsDirty();
              this.alerts.push("Le sigle " + unit.sigle.toUpperCase() + " est déjà utilisé");
              break;
            }
          }
        }
        idx++;

        // Unit CF
        // Error if an other unit has the same CF, only in "Create" mode
        for (let unitLoop of dataArray[idx]) {
          if (unitLoop.cf == unit.cf) {
            // If create mode
            if (this.mode == 'CREATE_CHILD' || this.mode == 'CREATE_ROOT' || this.mode == 'CLONE') {
              cfIsOk = false;
            }
            /*
            // If updating Unit
            else if (this.mode == 'UPDATE' && (unitLoop.id != this.selectedUnit.id && unitLoop.clonedFromId != this.selectedUnit.id)) {
              cfIsOk = false;
            }
            // If updating UnitPlanned
            else if (this.mode == 'EDIT_UNIT_PLANNED' && (unitLoop.id != this.selectedUnitPlanned.unitId && unitLoop.clonedFromId != this.selectedUnitPlanned.unitId)) {
              cfIsOk = false;
            }
            */
            if (!cfIsOk) {
              this.unitForm.get('cf').setErrors({ "error": true });
              this.unitForm.get('cf').markAsDirty();
              this.alerts.push("Le CF " + unit.cf + " est déjà utilisé");
              break;
            }
          }
        }
        idx++;

        // Unit Label
        // Error if an other unit has the same Label
        for (let unitLoop of dataArray[idx]) {
          if (unitLoop.label.toUpperCase() == unit.label.toUpperCase()) {
            // If create mode
            if (this.mode == 'CREATE_CHILD' || this.mode == 'CREATE_ROOT' || this.mode == 'CLONE') {
              labelIsOk = false;
            }
            // If updating Unit
            else if (this.mode == 'UPDATE' && (unitLoop.id != this.selectedUnit.id && unitLoop.clonedFromId != this.selectedUnit.id)) {
              labelIsOk = false;
            }
            // If updating UnitPlanned
            else if (this.mode == 'EDIT_UNIT_PLANNED' && (unitLoop.id != this.selectedUnitPlanned.unitId && unitLoop.clonedFromId != this.selectedUnitPlanned.unitId)) {
              labelIsOk = false;
            }

            if (!labelIsOk) {
              this.unitForm.get('label').setErrors({ "error": true });
              this.unitForm.get('label').markAsDirty();
              this.alerts.push("Le libellé " + unit.label + " est déjà utilisé");
              break;
            }
          }
        }
        idx++;

        // Unit LabelShort
        // Error if an other unit has the same LabelShort
        for (let unitLoop of dataArray[idx]) {
          if (unitLoop.labelShort.toUpperCase() == unit.labelShort.toUpperCase()) {
            // If create mode
            if (this.mode == 'CREATE_CHILD' || this.mode == 'CREATE_ROOT' || this.mode == 'CLONE') {
              labelShortIsOk = false;
            }
            // If updating Unit
            else if (this.mode == 'UPDATE' && (unitLoop.id != this.selectedUnit.id && unitLoop.clonedFromId != this.selectedUnit.id)) {
              labelShortIsOk = false;
            }
            // If updating UnitPlanned
            else if (this.mode == 'EDIT_UNIT_PLANNED' && (unitLoop.id != this.selectedUnitPlanned.unitId && unitLoop.clonedFromId != this.selectedUnitPlanned.unitId)) {
              labelShortIsOk = false;
            }

            if (!labelShortIsOk) {
              this.unitForm.get('labelShort').setErrors({ "error": true });
              this.unitForm.get('labelShort').markAsDirty();
              this.alerts.push("L'abrégé " + unit.labelShort + " est déjà utilisé");
              break;
            }
          }
        }
        idx++;

        // Check dates validity
        if (unit.from != '' && !moment(unit.from, "DD.MM.YYYY").isValid()) {
          unitFromIsOk = false;
          this.unitForm.get('from').setErrors({ "error": true });
          this.unitForm.get('from').markAsDirty();
          this.alerts.push("La date de début est invalide");
        }
        if (unit.to != '' && !moment(unit.to, "DD.MM.YYYY").isValid()) {
          unitToIsOk = false;
          this.unitForm.get('to').setErrors({ "error": true });
          this.unitForm.get('to').markAsDirty();
          this.alerts.push("La date de fin est invalide");
        }
        if (unit.from != '' && unit.to != '' && moment(unit.to, "DD.MM.YYYY").isBefore(moment(unit.from, "DD.MM.YYYY"))) {
          unitFromToConsistencyIsOk = false;
          this.unitForm.get('to').setErrors({ "error": true });
          this.unitForm.get('to').markAsDirty();
          this.alerts.push("La date de fin est avant la date de début");
        }

        // Check ApplyAt for UnitPlanned
        if (unit.applyAt != null && !moment(unit.applyAt, "DD.MM.YYYY").isValid()) {
          unitApplyAtIsOk = false;
          this.unitForm.get('applyAt').setErrors({ "error": true });
          this.unitForm.get('applyAt').markAsDirty();
          this.alerts.push("La date d'application est invalide");
        }
        if (unit.applyAt != null && moment(unit.applyAt, "DD.MM.YYYY").isBefore(moment())) {
          unitApplyAtIsOk = false;
          this.unitForm.get('applyAt').setErrors({ "error": true });
          this.unitForm.get('applyAt').markAsDirty();
          this.alerts.push("La date d'application est dans le passé");
        }

        // If everything is ok, then save unit
        if (roomIsOk &&
            responsibleIsOk &&
            sigleIsOk &&
            cfIsOk &&
            labelIsOk &&
            labelShortIsOk &&
            unitFromIsOk &&
            unitToIsOk &&
            unitFromToConsistencyIsOk &&
            unitApplyAtIsOk &&
            unitPlannedApplyAtIsOk &&
            parentUnitIsOk) {
          this.saveUnit(unit);
        }
        else {
          this.alertsModal.show();
        }
    });
  }

  /******************************************************
  *   save a unit
  ******************************************************/
  private saveUnit(unit: Unit) {
    // console.log('saving unit: ', JSON.stringify(unit));

    this.saveIsOngoing = true;

    // If no location selected, then take the string that is in the search input
    if (this.selectedLocation.zipcode == null) {
      this.selectedLocation.zipcode = '';
      this.selectedLocation.labelFrench = this.unitForm.get('addressLocationText').value;
    }

    // Handle dates
    let fromDate: string = Utils.getFormattedDate(this.unitForm.get('from') ? this.unitForm.get('from').value : null, this.dateValidationPattern);
    let toDate: string = Utils.getFormattedDate(this.unitForm.get('to') ? this.unitForm.get('to').value : null, this.dateValidationPattern);
    let applyAt: string = Utils.getFormattedDate(this.unitForm.get('applyAt') ? this.unitForm.get('applyAt').value : null, this.dateValidationPattern);

    /************************************************************************************************
     * Update existing unit
     ***********************************************************************************************/
    if (this.mode == 'UPDATE') {
      let selectedUnitPreviousParentId: number = this.selectedUnit.parentId;
      unit.id = this.selectedUnit.id;

      this.selectedUnit.from = fromDate;
      this.selectedUnit.to = toDate;

      // Handle other base form values
      this.selectedUnit.parentId = unit.parentId;
      this.selectedUnit.isTemporary = unit.isTemporary;
      this.selectedUnit.sigle = unit.sigle.toUpperCase();
      this.selectedUnit.label = unit.label;
      this.selectedUnit.labelShort = unit.labelShort;
      this.selectedUnit.type = unit.type;
      this.selectedUnit.lang = unit.lang;
      this.selectedUnit.cfNumber = unit.cfNumber;
      this.selectedUnit.cf = unit.cf;
      this.selectedUnit.isEpfl = unit.isEpfl;
      this.selectedUnit.longSigle = unit.longSigle;
      this.selectedUnit.level = unit.level;
      this.selectedUnit.position = unit.position;
      this.selectedUnit.responsibleId = unit.responsibleId;
      this.selectedUnit.roomId = unit.roomId;
      this.selectedUnit.zipcode = unit.zipcode;
      this.selectedUnit.station = unit.station;
      this.selectedUnit.isValid = unit.isValid;

      this.selectedUnit.attributes = this.selectedUnitAttributes;

      // Handle address
      // If no room selected, then take info from the Address tab form
      console.log('Update mode...');
      if ((this.selectedUnit.roomId == 0 || this.selectedUnit.roomId == null)
        && (this.unitForm.get('address1').value != null 
              || this.unitForm.get('address2').value != null
              || this.unitForm.get('address3').value != null
              || this.unitForm.get('address4').value != null
              || this.unitForm.get('addressCountryId').value != ''
              || this.unitForm.get('addressLocationId').value != ''
          )
        ) {
        this.selectedUnit.address = new Address('{}');
        this.selectedUnit.address.address1 = this.unitForm.get('address1').value;
        this.selectedUnit.address.address2 = this.unitForm.get('address2').value;
        this.selectedUnit.address.address3 = this.unitForm.get('address3').value;
        this.selectedUnit.address.address4 = this.unitForm.get('address4').value;
        this.selectedUnit.address.address5 = this.selectedCountry.codeISO + '-' + this.selectedLocation.zipcode + ' ' + this.selectedLocation.labelFrench;
        if (this.selectedLocation.zipcode == null) {
          this.selectedUnit.address.address5 = this.selectedCountry.codeISO;
        }
        this.selectedUnit.address.countryId = this.unitForm.get('addressCountryId').value;
        this.selectedUnit.address.pttOrder = this.unitForm.get('addressLocationId').value;
      }

      // Handle labels
      unit.labels = [];
      // ENG label
      let label = null;
      if (this.selectedUnit.labels != null) {
        // IMPORTANT: we get a reference to the label object,
        // i.e. every change to "label" are reported to this.selectedUnitPlanned automatically
        label = this.selectedUnit.labels.filter((item) => item.lang == 'ENG')[0];
      }
      if (label != null) {
        label.sigle = this.unitForm.get('sigleEn').value;
        label.label = this.unitForm.get('labelEn').value;
        label.labelShort = this.unitForm.get('labelShortEn').value;
      }
      else if (this.unitForm.get('labelEn').value != '') {
        label = new Label("{}");
        label.lang = 'ENG';
        label.sigle = this.unitForm.get('sigleEn').value;
        label.label = this.unitForm.get('labelEn').value;
        label.labelShort = this.unitForm.get('labelShortEn').value;
        this.selectedUnit.labels.push(label);
      }

      // DEU label
      label = null;
      if (this.selectedUnit.labels != null) {
        label = this.selectedUnit.labels.filter((item) => item.lang == 'DEU')[0];
      }
      if (label != null) {
        label.sigle = this.unitForm.get('sigleGe').value;
        label.label = this.unitForm.get('labelGe').value;
        label.labelShort = this.unitForm.get('labelShortGe').value;
      }
      else if (this.unitForm.get('labelGe').value != '') {
        label = new Label("{}");
        label.lang = 'DEU';
        label.sigle = this.unitForm.get('sigleGe').value;
        label.label = this.unitForm.get('labelGe').value;
        label.labelShort = this.unitForm.get('labelShortGe').value;
        this.selectedUnit.labels.push(label);
      }

      // ITA label
      label = null;
      if (this.selectedUnit.labels != null) {
        label = this.selectedUnit.labels.filter((item) => item.lang == 'ITA')[0];
      }
      if (label != null) {
        label.sigle = this.unitForm.get('sigleIt').value;
        label.label = this.unitForm.get('labelIt').value;
        label.labelShort = this.unitForm.get('labelShortIt').value;
      }
      else if (this.unitForm.get('labelIt').value != '') {
        label = new Label("{}");
        label.lang = 'ITA';
        label.sigle = this.unitForm.get('sigleIt').value;
        label.label = this.unitForm.get('labelIt').value;
        label.labelShort = this.unitForm.get('labelShortIt').value;
        this.selectedUnit.labels.push(label);
      }

      // console.log('you submitted unit: ', JSON.stringify(this.selectedUnit));

      this.treeService.updateUnit(this.selectedUnit)
        .subscribe(
          (res) => {
            this.errors = [];
            this.generatedChangeLogs = JSON.parse(res);
            this.accumulatedChangeLogs = this.accumulatedChangeLogs.concat(this.generatedChangeLogs);
            // console.log('this.accumulatedChangeLogs = ' + JSON.stringify(this.accumulatedChangeLogs));
          },
          (error) => {
            this.saveIsOngoing = false;

            let errorBody = JSON.parse(error._body);
            console.log("error updating unit");

            if (this.closeModalFlag) {
              this.closeModal();
            }

            this.errors = [];
            this.errors.push({msg: errorBody.reasons[0].message, type: 'danger', closable: true});

            this.messageTriggered.emit({ message: errorBody.reasons[0].message, level: 'danger' });
          },
          () => {
            console.log("updating unit finished");
            this.saveIsOngoing = false;

            let mode = "SAVE";
            if (this.closeModalFlag) {
              mode = "SAVE_AND_CLOSE";
              this.closeModal();
            }

            if (mode == 'SAVE') {
              // Retrieve unit change logs
              this.treeService.getUnitChangeLogs(unit.id)
                .subscribe(
                  (logs) => { this.changeLogs = logs },
                  (error) => console.log('error retrieving unit change logs'),
                  () => { }
                );
              
              this.treeService.getUnitById(unit.id)
                .subscribe(
                  (unit) => {
                    this.selectedUnit = unit;
                    this.selectedUnitAttributes = unit.attributes;
                    this.generateUnitAddress(this.selectedUnit);
                    this.refreshAddressForm(this.selectedUnit);
                  },
                  (error) => { },
                  () => { }
                );

              // Retrieve unit hierarchy
              this.treeService.getUnitHierarchy(unit.id)
                .subscribe(
                  (hierarchy) => {
                    this.unitHierarchy = hierarchy;
                  },
                  (error) => {
                    console.log('Unable to retrieve unit hierarchy');
                  },
                  () => { }
                );

              this.refreshRoomSelected(this.selectedUnit.roomId);
              this.refreshResponsibleSelected(this.selectedUnit.responsibleId);
            }

            this.unitUpdated.emit({mode: mode, changelogs: this.accumulatedChangeLogs, unit: this.selectedUnit, previousParentId: selectedUnitPreviousParentId});
            this.messageTriggered.emit({ message: 'Unité mise à jour avec succès', level: 'success' });
          }
        );
    }
    /************************************************************************************************
     * UnitPlanned
     ***********************************************************************************************/
    else if (this.mode == 'EDIT_UNIT_PLANNED') {
      // unit.id = this.selectedUnitPlanned.id;

      this.selectedUnitPlanned.from = fromDate;
      this.selectedUnitPlanned.to = toDate;
      this.selectedUnitPlanned.applyAt = applyAt;
      
      // handle other base form values
      //this.selectedUnitPlanned.unitId = unit.id;
      this.selectedUnitPlanned.isTemporary = unit.isTemporary;
      this.selectedUnitPlanned.sigle = unit.sigle;
      this.selectedUnitPlanned.label = unit.label;
      this.selectedUnitPlanned.labelShort = unit.labelShort;
      this.selectedUnitPlanned.type = unit.type;
      this.selectedUnitPlanned.lang = unit.lang;
      // Mandatory otherwise cfNumber field is set to null because it is "disabled"
      this.selectedUnitPlanned.cfNumber = this.unitForm.get('cfNumber').value;
      this.selectedUnitPlanned.cf = unit.cf;
      this.selectedUnitPlanned.isEpfl = unit.isEpfl;
      this.selectedUnitPlanned.longSigle = unit.longSigle;
      this.selectedUnitPlanned.level = unit.level;
      this.selectedUnitPlanned.parentId = unit.parentId;
      this.selectedUnitPlanned.position = unit.position;
      this.selectedUnitPlanned.responsibleId = unit.responsibleId;
      this.selectedUnitPlanned.roomId = unit.roomId;
      this.selectedUnitPlanned.zipcode = unit.zipcode;
      this.selectedUnitPlanned.station = unit.station;
      this.selectedUnitPlanned.isValid = unit.isValid;
      this.selectedUnitPlanned.attributes = this.selectedUnitAttributes;

      // Handle address
      // If no room selected, then take info from the Address tab form
      if ((unit.roomId == 0 || unit.roomId == null)
          && (this.unitForm.get('address1').value != '' 
              || this.unitForm.get('address2').value != ''
              || this.unitForm.get('address3').value != ''
              || this.unitForm.get('address4').value != ''
              || this.unitForm.get('addressCountryId').value != ''
              || this.unitForm.get('addressLocationId').value != ''
            )
      ) {
        this.selectedUnitPlanned.address = new Address('{}');
        this.selectedUnitPlanned.address.address1 = this.unitForm.get('address1').value;
        this.selectedUnitPlanned.address.address2 = this.unitForm.get('address2').value;
        this.selectedUnitPlanned.address.address3 = this.unitForm.get('address3').value;
        this.selectedUnitPlanned.address.address4 = this.unitForm.get('address4').value;
        this.selectedUnitPlanned.address.address5 = this.selectedCountry.codeISO + '-' + this.selectedLocation.zipcode + ' ' + this.selectedLocation.labelFrench;
        if (this.selectedLocation.zipcode == null) {
          this.selectedUnitPlanned.address.address5 = this.selectedCountry.codeISO;
        }
        this.selectedUnitPlanned.address.countryId = this.unitForm.get('addressCountryId').value;
        this.selectedUnitPlanned.address.pttOrder = this.unitForm.get('addressLocationId').value;
      }

      // handle labels
      unit.labels = [];
      // ENG label
      let label = null;
      if (this.selectedUnitPlanned.labels != null) {
        // IMPORTANT: we get a reference to the label object,
        // i.e. every change to "label" are reported to this.selectedUnitPlanned automatically
        label = this.selectedUnitPlanned.labels.filter((item) => item.lang == 'ENG')[0];
      }
      if (label != null) {
        label.sigle = this.unitForm.get('sigleEn').value;
        label.label = this.unitForm.get('labelEn').value;
        label.labelShort = this.unitForm.get('labelShortEn').value;
      }
      else if (this.unitForm.get('labelEn').value != '') {
        label = new Label("{}");
        label.lang = 'ENG';
        label.sigle = this.unitForm.get('sigleEn').value;
        label.label = this.unitForm.get('labelEn').value;
        label.labelShort = this.unitForm.get('labelShortEn').value;
        this.selectedUnitPlanned.labels.push(label);
      }

      // DEU label
      label = null;
      if (this.selectedUnitPlanned.labels != null) {
        label = this.selectedUnitPlanned.labels.filter((item) => item.lang == 'DEU')[0];
      }
      if (label != null) {
        label.sigle = this.unitForm.get('sigleGe').value;
        label.label = this.unitForm.get('labelGe').value;
        label.labelShort = this.unitForm.get('labelShortGe').value;
      }
      else if (this.unitForm.get('labelGe').value != '') {
        label = new Label("{}");
        label.lang = 'DEU';
        label.sigle = this.unitForm.get('sigleGe').value;
        label.label = this.unitForm.get('labelGe').value;
        label.labelShort = this.unitForm.get('labelShortGe').value;
        this.selectedUnitPlanned.labels.push(label);
      }

      // ITA label
      label = null;
      if (this.selectedUnitPlanned.labels != null) {
        label = this.selectedUnitPlanned.labels.filter((item) => item.lang == 'ITA')[0];
      }
      if (label != null) {
        label.sigle = this.unitForm.get('sigleIt').value;
        label.label = this.unitForm.get('labelIt').value;
        label.labelShort = this.unitForm.get('labelShortIt').value;
      }
      else if (this.unitForm.get('labelIt').value != '') {
        label = new Label("{}");
        label.lang = 'ITA';
        label.sigle = this.unitForm.get('sigleIt').value;
        label.label = this.unitForm.get('labelIt').value;
        label.labelShort = this.unitForm.get('labelShortIt').value;
        this.selectedUnitPlanned.labels.push(label);
      }

      // console.log('you submitted unit planned: ', JSON.stringify(this.selectedUnitPlanned));

      // test if the unit planned already exist
      this.treeService.getUnitPlannedById(this.selectedUnitPlanned.id)
        .subscribe(
          // if exist (no error), update it
          (res) => {
            this.treeService.updateUnitPlanned(this.selectedUnitPlanned)
              .subscribe(
                (res) => res,
                (error) => {
                  console.log("error updating unit");
                  this.saveIsOngoing = false;
                  this.closeModal();
                  this.messageTriggered
                    .emit({ message: 'Erreur lors de la modification de l\'unité planifiée', level: 'danger' });
                },
                () => {
                  // console.log("updating unit finished");
                  this.saveIsOngoing = false;

                  let mode = "SAVE";
                  if (this.closeModalFlag) {
                    mode = "SAVE_AND_CLOSE";
                    this.closeModal();
                    this.listUnitPlanned.emit(this.selectedUnit);
                  }
                  
                  this.unitPlannedDone.emit({mode: mode, unitPlanned: this.selectedUnitPlanned});
                  this.messageTriggered.emit({ message:'Unité planifiée modifiée avec succès', level: 'success' });
                }
              );
          },
          // if the unit planned doesn't exist (error 404), then create it
          (error) => {
            // console.log("creating unit planned for " + JSON.stringify(this.selectedUnitPlanned));
            this.treeService.createUnitPlanned(this.selectedUnitPlanned)
              .subscribe(
                (res) => res,
                (error) => {
                  console.log("error creating unit planned");
                  this.saveIsOngoing = false;
                  this.closeModal();
                  this.messageTriggered
                    .emit({ message: 'Erreur lors de la création de l\'unité planifiée', level: 'danger' });
                },
                () => {
                  // console.log("creating unit planned finished");
                  this.saveIsOngoing = false;                  
                  let mode = "SAVE";
                  if (this.closeModalFlag) {
                    mode = "SAVE_AND_CLOSE";
                    this.closeModal();
                    this.listUnitPlanned.emit(this.selectedUnit);
                  }

                  this.unitPlannedDone.emit({mode: mode, unitPlanned: this.selectedUnitPlanned});
                  this.messageTriggered
                    .emit({ message: 'Unité planifiée créée avec succès', level: 'success' });
                }
              );
          },
          () => {
            
          }
        );
    }
    /************************************************************************************************
     * UnitModel
     ***********************************************************************************************/
    else if (this.mode == 'EDIT_UNIT_MODEL') {
      unit.id = this.selectedUnitModel.id;

      this.selectedUnitModel.from = fromDate;
      this.selectedUnitModel.to = toDate;

      // handle other base form values
      this.selectedUnitModel.isTemporary = unit.isTemporary;
      this.selectedUnitModel.sigle = unit.sigle;
      this.selectedUnitModel.label = unit.label;
      this.selectedUnitModel.labelShort = unit.labelShort;
      this.selectedUnitModel.type = unit.type;
      this.selectedUnitModel.lang = unit.lang;
      // Mandatory otherwise cfNumber field is set to null because it is "disabled"
      this.selectedUnitModel.cfNumber = this.unitForm.get('cfNumber').value;
      this.selectedUnitModel.cf = unit.cf;
      this.selectedUnitModel.isEpfl = unit.isEpfl;
      this.selectedUnitModel.longSigle = unit.longSigle;
      this.selectedUnitModel.level = unit.level;
      this.selectedUnitModel.position = unit.position;
      this.selectedUnitModel.responsibleId = unit.responsibleId;
      this.selectedUnitModel.roomId = unit.roomId;
      this.selectedUnitModel.zipcode = unit.zipcode;
      this.selectedUnitModel.station = unit.station;
      this.selectedUnitModel.isValid = unit.isValid;

      // handle labels
      unit.labels = [];
      // ENG label
      let label = null;
      if (this.selectedUnitModel.labels != null) {
        // IMPORTANT: we get a reference to the label object, i.e. every change to "label" are reported to this.selectedUnitModel automatically
        label = this.selectedUnitModel.labels.filter((item) => item.lang == 'ENG')[0];
      }
      if (label != null) {
        label.sigle = this.unitForm.get('sigleEn').value;
        label.label = this.unitForm.get('labelEn').value;
        label.labelShort = this.unitForm.get('labelShortEn').value;
      }
      else if (this.unitForm.get('labelEn').value != '') {
        label = new Label("{}");
        label.lang = 'ENG';
        label.sigle = this.unitForm.get('sigleEn').value;
        label.label = this.unitForm.get('labelEn').value;
        label.labelShort = this.unitForm.get('labelShortEn').value;
        this.selectedUnitModel.labels.push(label);
      }

      // DEU label
      label = null;
      if (this.selectedUnitModel.labels != null) {
        label = this.selectedUnitModel.labels.filter((item) => item.lang == 'DEU')[0];
      }
      if (label != null) {
        label.sigle = this.unitForm.get('sigleGe').value;
        label.label = this.unitForm.get('labelGe').value;
        label.labelShort = this.unitForm.get('labelShortGe').value;
      }
      else if (this.unitForm.get('labelGe').value != '') {
        label = new Label("{}");
        label.lang = 'DEU';
        label.sigle = this.unitForm.get('sigleGe').value;
        label.label = this.unitForm.get('labelGe').value;
        label.labelShort = this.unitForm.get('labelShortGe').value;
        this.selectedUnitModel.labels.push(label);
      }

      // ITA label
      label = null;
      if (this.selectedUnitModel.labels != null) {
        label = this.selectedUnitModel.labels.filter((item) => item.lang == 'ITA')[0];
      }
      if (label != null) {
        label.sigle = this.unitForm.get('sigleIt').value;
        label.label = this.unitForm.get('labelIt').value;
        label.labelShort = this.unitForm.get('labelShortIt').value;
      }
      else if (this.unitForm.get('labelIt').value != '') {
        label = new Label("{}");
        label.lang = 'ITA';
        label.sigle = this.unitForm.get('sigleIt').value;
        label.label = this.unitForm.get('labelIt').value;
        label.labelShort = this.unitForm.get('labelShortIt').value;
        this.selectedUnitModel.labels.push(label);
      }

      // console.log('you submitted unit: ', this.selectedUnitModel);

      // test if the unit Model already exist
      this.treeService.getUnitModelById(this.selectedUnitModel.id)
        .subscribe(
          // if exist (no error), update it
          (res) => {
            this.treeService.updateUnitModel(this.selectedUnitModel)
              .subscribe(
                (res) => res,
                (error) => {
                  console.log("error updating unit model");
                  this.saveIsOngoing = false;
                  this.closeModal();
                  let errorBody = JSON.parse(error._body);
                  this.messageTriggered.emit({ message: 'Erreur lors de la mise à jour de l\'unité modèle', level: 'danger' });
                },
                () => {
                  console.log("updating unit model finished");
                  this.saveIsOngoing = false;
                  let mode = "SAVE";
                  if (this.closeModalFlag) {
                    mode = "SAVE_AND_CLOSE";
                    this.closeModal();
                  }

                  this.unitModelDone.emit(this.selectedUnitModel);
                  this.messageTriggered.emit({ message: 'Unité modèle mise à jour avec succès', level: 'success' });
                }
              );
          },
          // if the unit Model doesn't exist (error 404), then create it
          (error) => {
            // console.log("creating unit Model for " + JSON.stringify(this.selectedUnitModel));
            this.treeService.createUnitModel(this.selectedUnitModel)
              .subscribe(
                (res) => res,
                (error) => {
                  console.log("error creating unit model");
                  this.saveIsOngoing = false;
                  this.closeModal();
                  let errorBody = JSON.parse(error._body);
                  this.messageTriggered.emit({ message: 'Erreur lors de la création de l\'unité modèle', level: 'danger' });
                },
                () => {
                  console.log("creating unit model finished");
                  this.saveIsOngoing = false;
                  let mode = "SAVE";
                  if (this.closeModalFlag) {
                    mode = "SAVE_AND_CLOSE";
                    this.closeModal();
                  }

                  this.unitModelDone.emit(this.selectedUnitModel);
                  this.messageTriggered.emit({ message: 'Unité modèle créée avec succès', level: 'success' });
                }
              );
          },
          () => {}
        );
    }
    /************************************************************************************************
     * Create unit
     ***********************************************************************************************/
    else {
      unit.parentId = this.parentUnit.id;
      if (this.mode == 'CLONE') {
        unit.parentId = this.parentUnit.parentId;
      }
      
      unit.from = fromDate;
      unit.to = toDate;
      
      //handle labels
      unit.labels = [];
      //ENG label
      if (this.unitForm.get('labelEn').value != '') {
        let label = new Label("{}");
        label.lang = 'ENG';
        label.sigle = this.unitForm.get('sigleEn').value;
        label.label = this.unitForm.get('labelEn').value;
        label.labelShort = this.unitForm.get('labelShortEn').value;
        unit.labels.push(label);
      }

      //DEU label
      if (this.unitForm.get('labelGe').value != '') {
        let label = new Label("{}");
        label.lang = 'DEU';
        label.sigle = this.unitForm.get('sigleGe').value;
        label.label = this.unitForm.get('labelGe').value;
        label.labelShort = this.unitForm.get('labelShortGe').value;
        unit.labels.push(label);
      }

      //ITA label
    if (this.unitForm.get('labelIt').value != '') {
        let label = new Label("{}");
        label.lang = 'ITA';
        label.sigle = this.unitForm.get('sigleIt').value;
        label.label = this.unitForm.get('labelIt').value;
        label.labelShort = this.unitForm.get('labelShortIt').value;
        unit.labels.push(label);
      }

      // Have to do it otherwise, the input still contains lowercase chars despite the directive which converts to uppercase
      unit.sigle = this.unitForm.get('sigle').value.toUpperCase();
      // Mandatory otherwise cfNumber field is set to null because it is "disabled"
      unit.cfNumber = this.unitForm.get('cfNumber').value;
      unit.attributes = this.selectedUnitAttributes;

      // Handle address
      // If no room selected, then take info from the Address tab form
      if ((unit.roomId == 0 || unit.roomId == null)
          && (this.unitForm.get('address1').value != '' 
              || this.unitForm.get('address2').value != ''
              || this.unitForm.get('address3').value != ''
              || this.unitForm.get('address4').value != ''
              || this.unitForm.get('addressCountryId').value != ''
              || this.unitForm.get('addressLocationId').value != ''
            )
      ) {
        unit.address = new Address('{}');
        unit.address.address1 = this.unitForm.get('address1').value;
        unit.address.address2 = this.unitForm.get('address2').value;
        unit.address.address3 = this.unitForm.get('address3').value;
        unit.address.address4 = this.unitForm.get('address4').value;
        unit.address.address5 = this.selectedCountry.codeISO + '-' + this.selectedLocation.zipcode + ' ' + this.selectedLocation.labelFrench;
        if (this.selectedLocation.zipcode == null) {
          unit.address.address5 = this.selectedCountry.codeISO;
        }
        unit.address.countryId = this.unitForm.get('addressCountryId').value;
        unit.address.pttOrder = this.unitForm.get('addressLocationId').value;
      }

      // console.log('you submitted unit: ', JSON.stringify(unit));

      this.treeService.createUnit(unit)
        .subscribe(
          (res) => {
            this.errors = [];
            let location = res.headers.get('Location');
            this.generatedId = +location.substring(location.lastIndexOf('/') + 1);
            this.generatedChangeLogs = JSON.parse(res.text());
            this.accumulatedChangeLogs = this.accumulatedChangeLogs.concat(this.generatedChangeLogs);
            // console.log('this.accumulatedChangeLogs = ' + JSON.stringify(this.accumulatedChangeLogs));
          },
          (error) => {
            this.saveIsOngoing = false;
            let errorBody = JSON.parse(error._body);
            console.log("error creating unit");
            this.errors = [];
            this.errors.push({msg: errorBody.reasons[0].message, type: 'danger', closable: true});
            if (errorBody.reasons[0].code == 'E0101') {
              this.unitForm.get('sigle').setErrors({ "error": true });
              this.unitForm.get('sigle').markAsDirty();
            }
            if (errorBody.reasons[0].code == 'E0102') {
              this.unitForm.get('cf').setErrors({ "error": true });
              this.unitForm.get('cf').markAsDirty();
            }
          },
          () => {
            console.log("creating unit finished");
            this.saveIsOngoing = false;
            this.selectedUnit = unit;
            this.selectedUnit.id = this.generatedId;
            this.generatedChangeLogs = [];

            let mode = "SAVE";
            if (this.closeModalFlag) {
              mode = "SAVE_AND_CLOSE";
              this.closeModal();
            }
            else {
              this.triggerEditUnit(this.selectedUnit, 'UPDATE', false);
            }

            this.unitUpdated.emit({mode: mode, changelogs: this.accumulatedChangeLogs, unit: unit, previousParentId: 0});
            this.messageTriggered.emit({ message: 'Unité créée avec succès', level: 'success' });
          }
        );
    }
  }

  /******************************************************
  *   delete a unit planned
  ******************************************************/
  private deleteUnitPlanned() {
    this.treeService.deleteUnitPlanned(this.selectedUnitPlanned)
      .subscribe(
        (res) => res,
        (error) => {
          console.log("error deleting unit planned");
          this.modal.hide();
          this.messageTriggered
            .emit({ message: "Erreur lors de la suppression de l'unité planifiée", level: "danger" });
        },
        () => {
          console.log("deleting unit planned finished");
          this.modal.hide();
          this.unitPlannedDone.emit({mode: '', unitPlanned: this.selectedUnitPlanned});
          this.messageTriggered
            .emit({ message: "Unité planifiée supprimée avec succès", level: "success" });
          this.listUnitPlanned.emit(this.selectedUnit);
        }
      );
  }

  /******************************************************
  *   delete a unit Model
  ******************************************************/
  private deleteUnitModel() {
    this.treeService.deleteUnitModel(this.selectedUnitModel)
      .subscribe(
        (res) => res,
        (error) => {
          console.log("error deleting unit Model");
          this.modal.hide();
          this.messageTriggered.emit({ message: "Erreur lors de la suppression de l'unité modèle", level: "danger" });
        },
        () => {
          console.log("deleting unit Model finished");
          this.modal.hide();
          this.unitModelDone.emit(this.selectedUnitModel);
          this.messageTriggered.emit({ message: "Unité modèle supprimée avec succès", level: "success" });
        }
      );
  }

  /******************************************************
  *   closeModal
  ******************************************************/
  private closeModal() {
    this.showView = false;
    this.modal.hide();
  }

  private onHide() {
    this.showView = false;
  }

  /******************************************************
  *   set close flag when user click on "Enregistrer et fermer"
  ******************************************************/
  private setCloseFlag() {
    this.closeModalFlag = true;
  }

  /******************************************************
  *   calculate value for "CF Number" when something
  *   is types in "CF"
  ******************************************************/
  private setCfNumber() {
    let cfInt: number = +this.unitForm.get('cf').value;
    this.unitForm.get('cfNumber').setValue(cfInt);
  }

  /******************************************************
  *   get changelog attachment file
  ******************************************************/
  private getAttachment(id: number, filename: string) {
    this.treeService.downloadChangeLogAttachment(id, filename);
  }

  /******************************************************
  *   attribute type changed in form
  ******************************************************/
  private onAttributeTypeChange(newValue: string) {
    this.treeService.getAttributeEnums(newValue)
      .subscribe(
        (list) => {
          this.attributeEnumsList = list;
        },
        (error) => { console.log('error getting unit attribute enums'); },
        () => {
          if (this.attributeEnumsList.length > 0) {
            this.attributeForm.get("text").setValue(this.attributeEnumsList[0].value);
            this.attributeForm.get("textSelect").setValue(this.attributeEnumsList[0].value);
          }
          else {
            this.attributeForm.get("text").setValue("");
          }
         }
      );
  }

  /******************************************************
  *   attribute value changed in form
  ******************************************************/
  private onAttributeValueChange(newValue: string) {
    this.attributeForm.get("text").setValue(newValue);
  }

  /******************************************************
  *   generate displayable unit address
  ******************************************************/
  private generateUnitAddress(unit: any) {
    this.cadiService.getUnitAddress(unit.sigle, '|')
      .subscribe(
        (address) => {
          if (address.address != null) {
            this.selectedUnitAddress = address.address.split("|").join("<br />");
          }
        },
        (error) => console.log('error retrieving unit address'),
        () => { }
      );
    /*
    this.selectedUnitAddress = '';
    if (unit.address.address1 != null) {
      this.selectedUnitAddress += unit.address.address1 + '<br />';
    }
    if (unit.address.address2 != null) {
      this.selectedUnitAddress += unit.address.address2 + '<br />';
    }
    if (unit.address.address3 != null) {
      this.selectedUnitAddress += unit.address.address3 + '<br />';
    }
    if (unit.address.address4 != null) {
      this.selectedUnitAddress += unit.address.address4 + '<br />';
    }
    if (unit.address.address5 != null) {
      this.selectedUnitAddress += unit.address.address5 + '<br />';
    }
    */
  }

  /******************************************************
  *   refresh address form
  ******************************************************/
  private refreshAddressForm(unit: any) {
    if (unit.address != null && unit.address.address1 != null) {
      this.unitForm.get('address1').setValue(unit.address.address1);
    }
    if (unit.address != null && unit.address.address2 != null) {
      this.unitForm.get('address2').setValue(unit.address.address2);
    }
    if (unit.address != null && unit.address.address3 != null) {
      this.unitForm.get('address3').setValue(unit.address.address3);
    }
    if (unit.address != null && unit.address.address4 != null) {
      this.unitForm.get('address4').setValue(unit.address.address4);
    }

    // Retrieve location from cadi service
    if (unit.address != null && unit.address.pttOrder != null) {
      this.refreshLocationSelected(unit.address.pttOrder);
    }

    // Retrieve country from cadi service
    if (unit.address != null && unit.address.countryId != null) {
      this.refreshCountrySelected(unit.address.countryId);
    }
  }

  /******************************************************
  *   to check the checkbox for selected changelog
  ******************************************************/
  private selectChangeLog(id: string) {
    (<HTMLInputElement>document.getElementById('changeLogSelect_' + id)).checked = !(<HTMLInputElement>document.getElementById('changeLogSelect_' + id)).checked;
  }

  /******************************************************
  *   trigger changedoc component to associate document to selected changes
  ******************************************************/
  private documentSelectedChangeLogs() {
    let jsonArrayOuput : string = '[ ';
    let selectedChangeLogsCpt : number = 0;
    for (let changeLog of this.changeLogs) {
      // If element is checked, then add it to the changeLogs list to pass to the changedoc component
      if ((<HTMLInputElement>document.getElementById('changeLogSelect_' + changeLog.id)).checked) {
        jsonArrayOuput += JSON.stringify(changeLog) + ',';
        selectedChangeLogsCpt++;
      }
    }
    jsonArrayOuput = jsonArrayOuput.substring(0, jsonArrayOuput.length - 1);
    jsonArrayOuput += ']';
    //console.log("jsonArrayOuput = " + jsonArrayOuput);
    if (selectedChangeLogsCpt > 0) {
      this.myChangeDocComponent.triggerCreateChangeDoc(this.selectedUnit, jsonArrayOuput);
    }
  }

  /******************************************************
  *   Undocument selected changes
  ******************************************************/
  private undocumentSelectedChangeLogs() {
    let jsonArrayOuput : string = '[ ';
    let selectedChangeLogsCpt : number = 0;
    for (let changeLog of this.changeLogs) {
      // If element is checked, then add it to the changeLogs list to pass to the changedoc component
      if ((<HTMLInputElement>document.getElementById('changeLogSelect_' + changeLog.id)).checked) {
        jsonArrayOuput += JSON.stringify(changeLog) + ',';
        selectedChangeLogsCpt++;
      }
    }
    jsonArrayOuput = jsonArrayOuput.substring(0, jsonArrayOuput.length - 1);
    jsonArrayOuput += ']';

    this.changeAttachmentData = new FormData();
    this.changeAttachmentData.append('changes', jsonArrayOuput);
    this.changeAttachmentData.append('doDeleteFile', 'Y');

    // console.log("jsonArrayOuput = " + jsonArrayOuput);
    this.treeService.patchChangeLogs(this.selectedUnit, this.changeAttachmentData).subscribe(
      (res) => {
        console.log("ChangeLogs updated successfully");
        this.changeDocCreated();
      },
      (error) => {
        console.log("Error updating ChangeLogs");
      },
      () => {
        //this.messageTriggered.emit({ message: 'Documentation créée avec succès', level: 'success' });
      }
    );
  }

  /******************************************************
  *   changedoc has been created
  ******************************************************/
  private changeDocCreated() {
    // Retrieve unit change logs to refresh them
    this.treeService.getUnitChangeLogs(this.selectedUnit.id)
      .subscribe(
        (logs) => {
          this.changeLogs = logs;
        },
        (error) => console.log('error retrieving unit change logs'),
        () => { }
      );
  }

  /******************************************************
  *   Refresh selected address country in UI
  ******************************************************/
  private refreshCountrySelected(countryId: number) {
    this.placeService.getCountryById(countryId)
      .subscribe(
        (country) => {
          this.countrySelected(country);
        },
        (error) => {
          console.log('Unable to retrieve address country');
          this.unitForm.get('addressCountryText').setValue('');
          this.unitForm.get('addressCountryId').setValue('');
        },
        () => { }
      );
  }

  /******************************************************
  *   Refresh selected address location in UI
  ******************************************************/
  private refreshLocationSelected(pttOrder: number) {
    this.placeService.getLocationsByPttOrder(pttOrder)
      .subscribe(
        (locations) => {
          if (locations.length > 0) {
            this.locationSelected(locations[0]);
          }
        },
        (error) => {
          console.log('Unable to retrieve location');
          this.unitForm.get('addressLocationText').setValue('');
          this.unitForm.get('addressLocationId').setValue('');
        },
        () => { }
      );
  }

  /******************************************************
  *   Refresh selected room in UI
  ******************************************************/
  private refreshRoomSelected(roomId: number) {
    this.infrastructureService.getRoomById(roomId)
      .subscribe(
        (room) => {
          this.selectedRoom = room;
          this.unitForm.get('room').setValue(this.selectedRoom.label);
          this.showAddressTab = false;
        },
        (error) => {
          console.log('Unable to retrieve room');
          this.unitForm.get('room').setValue('');
          this.unitForm.get('roomId').setValue('');
          this.showAddressTab = true;
        },
        () => { }
      );
  }

  /******************************************************
  *   Refresh selected room in UI
  ******************************************************/
  private refreshResponsibleSelected(responsibleId: number) {
    this.sciperService.getById(responsibleId)
      .subscribe(
        (person) => {
          this.selectedResponsible = person;
          this.matchingResponsible = person;
          this.unitForm.get('responsible').setValue(this.matchingResponsible.displayname);
        },
        (error) => {
          console.log('Unable to retrieve responsible');
          this.unitForm.get('responsible').setValue('');
          this.unitForm.get('responsibleId').setValue('');
        },
        () => { }
      );
  }

  /******************************************************
  *   Refresh selected room in UI
  ******************************************************/
  private refreshParentUnitSelected(parentId: number) {
    this.treeService.getUnitById(parentId)
      .subscribe(
        (parentUnit) => {
          this.selectedParentUnit = parentUnit;
        },
        (error) => {
          console.log('Unable to retrieve parent unit');
          this.unitForm.get('parentId').setValue('');
        },
        () => { }
      );
  }

  /******************************************************
  *   destroy component
  ******************************************************/
  public ngOnDestroy() {
    // console.log('ngOnDestroy `UpdateUnit` component');
    this.loggedUserInfoSubscription.unsubscribe();
  }

  /******************************************************
  *   init component
  ******************************************************/
  public ngOnInit() {
    this.loggedUserInfo = { "username": "", "uniqueid": 0, "scopes": "read" };
    this.loggedUserInfoSubscription =
      this.sharedAppStateService.loggedUserInfo.subscribe((info) => this.loggedUserInfo = info);

    this.root = null;
    this.selectedUnit = new Unit({});
    this.unitToDelete = new Unit({});
    this.unitToCreateChild = new Unit({});
    this.selectedUnitAttributes = [];
    this.onlyPermanent = true;
    this.onlyValid = true;
    this.expandedUnits = Array();
    this.selectedUnitAddress = '';
    this.unitHierarchy = {};
    this.matchingResponsible = {"displayname": ""};
    this.selectedRoom = {"label": ""};
    this.selectedParentUnit = {"sigle": "", "label": ""};
    this.attributeEnumsList = [];
    this.changeAttachmentData = new FormData();
    this.accumulatedChangeLogs = [];
    this.searchReponsibleResults = [];
    this.searchLocationResults = [];
    this.searchCountryResults = [];
    this.fromUnit = new Unit({});
    this.selectedLocation = {};
    this.selectedCountry = {};
    this.unitTypesList = [];
    this.languagesList = [];
    this.attributesList = [];

    this.labelENG = new Label("{}");
    this.labelDEU = new Label("{}");
    this.labelITA = new Label("{}");

    this.unitForm = this.fb.group({
      label: this.fb.control(''),
      sigle: this.fb.control(''),
      labelShort: this.fb.control(''),
      type: this.fb.control(''),
      lang: this.fb.control(''),
      cfNumber: this.fb.control({ value: '', disabled: true }),
      cf: this.fb.control(''),
      from: this.fb.control(''),
      to: this.fb.control(''),
      responsible: this.fb.control(''),
      responsibleId: this.fb.control(''),
      responsibleSearchText: this.fb.control(''),
      position: this.fb.control(''),
      parentId: this.fb.control(''),
      parentUnitSearchText: this.fb.control(''),
      room: this.fb.control(''),
      roomId: this.fb.control(''),
      roomSearchText: this.fb.control(''),
      isTemporary: this.fb.control(''),
      sigleEn: this.fb.control(''),
      sigleGe: this.fb.control(''),
      sigleIt: this.fb.control(''),
      labelEn: this.fb.control(''),
      labelGe: this.fb.control(''),
      labelIt: this.fb.control(''),
      labelShortEn: this.fb.control(''),
      labelShortGe: this.fb.control(''),
      labelShortIt: this.fb.control(''),
      address1: this.fb.control(''),
      address2: this.fb.control(''),
      address3: this.fb.control(''),
      address4: this.fb.control(''),
      addressLocationText: this.fb.control(''),
      addressCountryText: this.fb.control('')
    });

    this.attributeForm = this.fb.group({
      code: this.fb.control('', Validators.required),
      text: this.fb.control('', Validators.required),
      textSelect: this.fb.control(''),
      url: this.fb.control(''),
      from: this.fb.control(moment().format('DD.MM.YYYY'), Validators.required),
      to: this.fb.control('')
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
  }
}
