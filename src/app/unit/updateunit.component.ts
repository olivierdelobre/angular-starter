import { Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
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
  @ViewChild('alertsModal') alertsModal: ModalDirective;
  @ViewChild('fileUploadInput') fileUploadInput: any;
  @ViewChild('myChangeDocComponent') myChangeDocComponent: ChangeDocComponent;

  @Output() unitUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Output() unitPlannedDone: EventEmitter<any> = new EventEmitter<any>();
  @Output() unitModelDone: EventEmitter<UnitModel> = new EventEmitter<UnitModel>();
  @Output() messageTriggered: EventEmitter<any> = new EventEmitter<any>();
  
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

  public resultsParent: any[];
  public myunit: Unit;
  public matchingResponsible: any;
  public selectedRoom: any;
  public matchingParent: any;
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
  public dateValidationPattern: string = '^(0[1-9]|[12][0-9]|3[01])[\\.](0[1-9]|1[012])[\\.]\\d{4}$';

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
    this.searchLocationShowResults = false;
    this.searchCountryShowResults = false;
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
  public triggerUnitPlanned(unit: UnitPlanned, exists: boolean) {
    // console.log('handling unit planned form unit: ', JSON.stringify(unit));
    this.mode = 'EDIT_UNIT_PLANNED';
    this.selectedUnitPlanned = unit;
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

    // Handle "from" date
    let formValue: string = this.attributeForm.get('from').value;
      if (formValue != null && formValue != '') {
      this.selectedUnitAttribute.from = formValue.substring(6, 10) + "-"
        + formValue.substring(3, 5) + "-"
        + formValue.substring(0, 2) + "T00:00:00.000Z";
    }
    else {
      this.selectedUnitAttribute.from = null;
    }

    // Handle "to" date
    formValue = this.attributeForm.get('to').value;
    if (formValue != null && formValue != '') {
      this.selectedUnitAttribute.to = formValue.substring(6, 10) + "-"
        + formValue.substring(3, 5) + "-"
        + formValue.substring(0, 2) + "T00:00:00.000Z";
    }
    else {
      this.selectedUnitAttribute.to = null;
    }

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
    if (this.unitForm.get('addressLocationText').value.length < 2) {
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
    this.selectedLocation = location;
    this.searchLocationResults = [];
    this.unitForm.get('addressLocationText').setValue('');
    this.unitForm.get('addressLocationId').setValue(location.pttOrder);
    console.log("location selected " + location.pttOrder);
    this.selectLocationModal.hide();
  }

  /******************************************************
  *   autocomplete result for country search
  ******************************************************/
  private searchCountry() {
    if (this.unitForm.get('addressCountryText').value.length < 2) {
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
    if (this.unitForm.get('responsibleSearchText').value.length < 3) {
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
  private searchParent(event) {
    this.treeService.searchUnits(event.query, '', '', '', '', 0, '', '', '', '', '', '', [])
      .subscribe(
        (parents) => this.resultsParent = parents,
        (error) => console.log('error retrieving parent units list')
    );
  }

  /******************************************************
  *   a parent is selected in the autocomplete select
  ******************************************************/
  private parentSelected(event) {
    this.unitForm.get('parent').setValue(event.sigle + ' / ' + event.label);
    this.unitForm.get('parentId').setValue(event.id);
    console.log("parent selected " + event.id);
  }

  /******************************************************
  *   clear parent in form
  ******************************************************/
  private clearParent() {
    this.unitForm.get('parent').setValue('');
    this.unitForm.get('parentId').setValue(0);
  }

  /******************************************************
  *   autocomplete result for room search
  ******************************************************/
  private searchRoom() {
    if (this.unitForm.get('roomSearchText').value.length < 2) {
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
      label: this.fb.control(unit.label, [Validators.required, Validators.maxLength(80)]),
      sigle: this.fb.control(unit.sigle, [Validators.required, Validators.maxLength(12)]),
      labelShort: this.fb.control(unit.labelShort, [Validators.required, Validators.maxLength(40)]),
      type: this.fb.control(unit.type, Validators.required),
      lang: this.fb.control(unit.lang, Validators.required),
      cfNumber: this.fb.control({ value: unit.cfNumber, disabled: true }, Validators.required),
      cf: this.fb.control(unit.cf, [Validators.required, Validators.minLength(4), Validators.maxLength(5)]),
      from: this.fb.control(unit.from == null ? '':moment(unit.from).format('DD.MM.YYYY'), [Validators.required, Validators.pattern(this.dateValidationPattern)]),
      to: this.fb.control(unit.to == null ? '':moment(unit.to).format('DD.MM.YYYY'), [Validators.pattern(this.dateValidationPattern)]),
      responsible: this.fb.control(''),
      responsibleId: this.fb.control(unit.responsibleId),
      responsibleSearchText: this.fb.control(''),
      parent: this.fb.control(''),
      position: this.fb.control(unit.position),
      parentId: this.fb.control(unit.parentId, Validators.required),
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
      this.sciperService.getById(unit.responsibleId)
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

    // Retrieve room from cadi service
    if (unit.roomId != null) {
      this.infrastructureService.getRoomById(unit.roomId)
        .subscribe(
          (room) => {
            this.selectedRoom = room;
            this.unitForm.get('room').setValue(this.selectedRoom.label);
          },
          (error) => {
            console.log('Unable to retrieve room');
            this.unitForm.get('room').setValue('');
            this.unitForm.get('roomId').setValue('');
          },
          () => { }
        );
    }

    // Retrieve location from cadi service
    if (unit.address != null && unit.address.pttOrder != null) {
      this.placeService.getLocationsByPttOrder(unit.address.pttOrder)
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

    // Retrieve country from cadi service
    if (unit.address != null && unit.address.countryId != null) {
      this.placeService.getCountryById(unit.address.countryId)
        .subscribe(
          (country) => {
            this.countrySelected(country);
          },
          (error) => {
            console.log('Unable to retrieve location');
            this.unitForm.get('addressCountryText').setValue('');
            this.unitForm.get('addressCountryId').setValue('');
          },
          () => { }
        );
    }

    // Retrieve parent unit
    if (unit.parentId != null && unit.parentId != 0) {
      this.treeService.getUnitById(unit.parentId)
        .subscribe(
          (parentUnit) => {
            this.matchingParent = parentUnit;
            this.unitForm.get('parent').setValue(this.matchingParent.sigle + ' / ' + this.matchingParent.label);
          },
          (error) => {
            console.log('Unable to retrieve parent unit');
            this.unitForm.get('parent').setValue('');
            this.unitForm.get('parentId').setValue('');
          },
          () => { }
        );
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
        label: this.fb.control(unitModel.label, [Validators.required, Validators.maxLength(80)]),
        sigle: this.fb.control(unitModel.sigle, [Validators.required, Validators.maxLength(12)]),
        labelShort: this.fb.control(unitModel.labelShort, [Validators.required, Validators.maxLength(40)]),
        type: this.fb.control(unitModel.type, Validators.required),
        lang: this.fb.control(unitModel.lang, Validators.required),
        cfNumber: this.fb.control({ value: unitModel.cfNumber, disabled: true }, Validators.required),
        cf: this.fb.control(unitModel.cf, [Validators.required, Validators.minLength(4), Validators.maxLength(5)]),
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
        this.sciperService.getById(unitModel.responsibleId)
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

      //retrieve room from cadi service
      if (unitModel.roomId != null && unitModel.roomId != 0) {
        this.infrastructureService.getRoomById(unitModel.roomId)
          .subscribe(
            (room) => {
              this.selectedRoom = room;
              this.unitForm.get('room').setValue(this.selectedRoom.label);
            },
            (error) => {
              console.log('Unable to retrieve room');
              this.unitForm.get('room').setValue('');
              this.unitForm.get('roomId').setValue('');
            },
            () => { }
          );
      }

      //retrieve attributes from unit service
      this.selectedUnitAttributes = unitModel.attributes;
    }
    else {
      this.unitForm = this.fb.group({
        label: this.fb.control('', [Validators.required, Validators.maxLength(80)]),
        sigle: this.fb.control('', [Validators.required, Validators.maxLength(12)]),
        labelShort: this.fb.control('', [Validators.required, Validators.maxLength(40)]),
        type: this.fb.control('', Validators.required),
        lang: this.fb.control('FRA', Validators.required),
        cfNumber: this.fb.control({ value: '', disabled: true }, Validators.required),
        cf: this.fb.control('', [Validators.required, Validators.minLength(4), Validators.maxLength(5)]),
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

    // Retrieve location from cadi service
    if (unitModel != null && unitModel.address != null && unitModel.address.pttOrder != null) {
      this.placeService.getLocationsByPttOrder(unitModel.address.pttOrder)
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

    // Retrieve country from cadi service
    if (unitModel != null && unitModel.address != null && unitModel.address.countryId != null) {
      this.placeService.getCountryById(unitModel.address.countryId)
        .subscribe(
          (country) => {
            this.countrySelected(country);
          },
          (error) => {
            console.log('Unable to retrieve location');
            this.unitForm.get('addressCountryText').setValue('');
            this.unitForm.get('addressCountryId').setValue('');
          },
          () => { }
        );
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
      label: this.fb.control(unit.label, [Validators.required, Validators.maxLength(80)]),
      sigle: this.fb.control(unit.sigle, [Validators.required, Validators.maxLength(12)]),
      labelShort: this.fb.control(unit.labelShort, [Validators.required, Validators.maxLength(40)]),
      type: this.fb.control(unit.type, Validators.required),
      lang: this.fb.control(unit.lang, Validators.required),
      cfNumber: this.fb.control({ value: unit.cfNumber, disabled: true }, Validators.required),
      cf: this.fb.control(unit.cf, [Validators.required, Validators.minLength(4), Validators.maxLength(5)]),
      from: this.fb.control(unit.from == null ? '':moment(unit.from).format('DD.MM.YYYY'), [Validators.required, Validators.pattern(this.dateValidationPattern)]),
      to: this.fb.control(unit.to == null ? '':moment(unit.to).format('DD.MM.YYYY'), [Validators.pattern(this.dateValidationPattern)]),
      responsible: this.fb.control(''),
      responsibleId: this.fb.control(unit.responsibleId),
      responsibleSearchText: this.fb.control(''),
      position: this.fb.control(unit.position),
      room: this.fb.control(''),
      roomId: this.fb.control(unit.roomId),
      roomSearchText: this.fb.control(''),
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
      this.sciperService.getById(unit.responsibleId)
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

    // retrieve room from cadi service
    if (unit.roomId != null && unit.roomId != 0) {
      this.infrastructureService.getRoomById(unit.roomId)
        .subscribe(
          (room) => {
            this.selectedRoom = room;
            this.unitForm.get('room').setValue(this.selectedRoom.label);
          },
          (error) => {
            console.log('Unable to retrieve room');
            this.unitForm.get('room').setValue('');
            this.unitForm.get('roomId').setValue('');
          },
          () => { }
        );
    }

    // retrieve attributes from unit service
    this.selectedUnitAttributes = unit.attributes;

    // Retrieve location from cadi service
    if (unit.address != null && unit.address.pttOrder != null) {
      this.placeService.getLocationsByPttOrder(unit.address.pttOrder)
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

    // Retrieve country from cadi service
    if (unit.address != null && unit.address.countryId != null) {
      this.placeService.getCountryById(unit.address.countryId)
        .subscribe(
          (country) => {
            this.countrySelected(country);
          },
          (error) => {
            console.log('Unable to retrieve location');
            this.unitForm.get('addressCountryText').setValue('');
            this.unitForm.get('addressCountryId').setValue('');
          },
          () => { }
        );
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
      label: this.fb.control(unit.label, [Validators.maxLength(80)]),
      sigle: this.fb.control(unit.sigle, [Validators.maxLength(12)]),
      labelShort: this.fb.control(unit.labelShort, [Validators.maxLength(40)]),
      type: this.fb.control(unit.type),
      lang: this.fb.control(unit.lang),
      cfNumber: this.fb.control({ value: unit.cfNumber, disabled: true }),
      cf: this.fb.control(unit.cf, [Validators.maxLength(5)]),
      from: this.fb.control(unit.from == null ? '':moment(unit.from).format('DD.MM.YYYY'), [Validators.pattern(this.dateValidationPattern)]),
      to: this.fb.control(unit.to == null ? '':moment(unit.to).format('DD.MM.YYYY'), [Validators.pattern(this.dateValidationPattern)]),
      responsible: this.fb.control(''),
      responsibleId: this.fb.control(unit.responsibleId),
      responsibleSearchText: this.fb.control(''),
      position: this.fb.control(unit.position),
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
      this.sciperService.getById(unit.responsibleId)
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

    // retrieve room from cadi service
    if (unit.roomId != null && unit.roomId != 0) {
      this.infrastructureService.getRoomById(unit.roomId)
        .subscribe(
          (room) => {
            this.selectedRoom = room;
            this.unitForm.get('room').setValue(this.selectedRoom.label);
          },
          (error) => {
            console.log('Unable to retrieve room');
            this.unitForm.get('room').setValue('');
            this.unitForm.get('roomId').setValue('');
          },
          () => { }
        );
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

    // console.log('Checking unit: ', JSON.stringify(unit));

    if ((unit.roomId == null || unit.roomId == 0) && this.unitForm.get('roomSearchText').value != '') {
      observableRoomIsSet = true;
      observables.push(this.infrastructureService.searchRoomsByLabel(this.unitForm.get('roomSearchText').value));
    }
    if ((unit.responsibleId == null || unit.responsibleId == 0) && this.unitForm.get('responsibleSearchText').value != '') {
      observableResponsibleIsSet = true;
      observables.push(this.sciperService.searchByName(this.unitForm.get('responsibleSearchText').value));
    }
    observables.push(this.treeService.searchUnits(unit.sigle, '', '', '', '', 0, '', '', '', '', 'N', 'N', []));
    observables.push(this.treeService.searchUnits('', '', unit.cf, '', '', 0, '', '', '', '', 'N', 'N', []));

    Observable.forkJoin(observables)
      .subscribe((dataArray) => {
        let roomIsOk: boolean = true;
        let responsibleIsOk: boolean = true;
        let unitSigleIsOk: boolean = true;
        let unitCFIsOk: boolean = true;
        let unitFromIsOk: boolean = true;
        let unitToIsOk: boolean = true;
        let unitFromToConsistencyIsOk: boolean = true;
        let unitApplyAtIsOk: boolean = true;
        
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
            this.alerts.push("Aucun bureau trouvé pour " + this.unitForm.get('roomSearchText').value);
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
            this.alerts.push("Aucun responsable trouvé pour " + this.unitForm.get('responsibleSearchText').value);
          }
          idx++;
        }

        // Unit sigle
        // Error if an other unit has the same sigle
        for (let unitLoop of dataArray[idx]) {
          if (unitLoop.sigle == unit.sigle.toUpperCase()) {
            // If create mode
            if (this.mode == 'CREATE_CHILD' || this.mode == 'CREATE_ROOT' || this.mode == 'CLONE') {
              unitSigleIsOk = false;
            }
            // If updating Unit
            else if (this.mode == 'UPDATE' && unitLoop.id != this.selectedUnit.id) {
              unitSigleIsOk = false;
            }
            // If updating UnitPlanned
            else if (this.mode == 'EDIT_UNIT_PLANNED' && unitLoop.id != this.selectedUnitPlanned.id) {
              unitSigleIsOk = false;
            }

            if (!unitSigleIsOk) {
              this.unitForm.get('sigle').setErrors({ "error": true });
              this.unitForm.get('sigle').markAsDirty();
              this.alerts.push("Le sigle " + unit.sigle.toUpperCase() + " est déjà utilisé");
            }
          }
        }
        idx++;

        // Unit CF
        // Error if an other unit has the same CF
        for (let unitLoop of dataArray[idx]) {
          if (unitLoop.cf == unit.cf) {
            // If create mode
            if (this.mode == 'CREATE_CHILD' || this.mode == 'CREATE_ROOT' || this.mode == 'CLONE') {
              unitCFIsOk = false;
            }
            // If updating Unit
            else if (this.mode == 'UPDATE' && unitLoop.id != this.selectedUnit.id) {
              unitCFIsOk = false;
            }
            // If updating UnitPlanned
            else if (this.mode == 'EDIT_UNIT_PLANNED' && unitLoop.id != this.selectedUnitPlanned.id) {
              unitCFIsOk = false;
            }

            if (!unitCFIsOk) {
              this.unitForm.get('cf').setErrors({ "error": true });
              this.unitForm.get('cf').markAsDirty();
              this.alerts.push("Le CF " + unit.cf + " est déjà utilisé");
            }
          }
        }
        idx++;

        // Check dates validity
        if (!moment(unit.from, "DD.MM.YYYY").isValid()) {
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
        if (roomIsOk && responsibleIsOk && unitSigleIsOk && unitCFIsOk && unitFromIsOk && unitToIsOk && unitFromToConsistencyIsOk && unitApplyAtIsOk) {
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

    /************************************************************************************************
     * Update existing unit
     ***********************************************************************************************/
    if (this.mode == 'UPDATE') {
      unit.id = this.selectedUnit.id;

      // Handle "from" date
      let formValue: string = this.unitForm.get('from').value;
      if (formValue != null && formValue != '') {
        this.selectedUnit.from = formValue.substring(6, 10) + "-"
          + formValue.substring(3, 5)+ "-"
          + formValue.substring(0, 2) + "T00:00:00.000Z";
      }
      else {
        this.selectedUnit.from = null;
      }

      // Handle "to" date
      formValue = this.unitForm.get('to').value;
      if (formValue != null && formValue != '') {
        this.selectedUnit.to = formValue.substring(6, 10) + "-" +
          formValue.substring(3, 5) + "-" +
          formValue.substring(0, 2) + "T00:00:00.000Z";
      }
      else {
        this.selectedUnit.to = null;
      }

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
                    this.generateUnitAddress(this.selectedUnit);
                    this.refreshAddressForm(this.selectedUnit);
                  },
                  (error) => { },
                  () => { }
                );
            }

            this.unitUpdated.emit({mode: mode, changelogs: this.accumulatedChangeLogs, unit: this.selectedUnit});
            this.messageTriggered.emit({ message: 'Unité mise à jour avec succès', level: 'success' });
          }
        );
    }
    /************************************************************************************************
     * UnitPlanned
     ***********************************************************************************************/
    else if (this.mode == 'EDIT_UNIT_PLANNED') {
      unit.id = this.selectedUnitPlanned.id;

      // handle "from" date
      let formValue: string = this.unitForm.get('from').value;
        if (formValue != null && formValue != '') {
        this.selectedUnitPlanned.from = formValue.substring(6, 10) + "-"
          + formValue.substring(3, 5) + "-"
          + formValue.substring(0, 2) + "T00:00:00.000Z";
      }
      else {
        this.selectedUnitPlanned.from = null;
      }

      // handle "to" date
      formValue = this.unitForm.get('to').value;
      if (formValue != null && formValue != '') {
        this.selectedUnitPlanned.to = formValue.substring(6, 10) + "-"
          + formValue.substring(3, 5) + "-"
          + formValue.substring(0, 2) + "T00:00:00.000Z";
      }
      else {
        this.selectedUnitPlanned.to = null;
      }

      // handle "applyAt" date
      formValue = this.unitForm.get('applyAt').value;
        if (formValue != null && formValue != '') {
        this.selectedUnitPlanned.applyAt = formValue.substring(6, 10) + "-"
          + formValue.substring(3, 5) + "-"
          + formValue.substring(0, 2) + "T00:00:00.000Z";
      }
      else {
        this.selectedUnitPlanned.applyAt = null;
      }

      // handle other base form values
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

      // handle "from" date
      let formValue: string = this.unitForm.get('from').value;
        if (formValue != null && formValue != '') {
        this.selectedUnitModel.from = formValue.substring(6, 10) + "-" + formValue.substring(3, 5) + "-" + formValue.substring(0, 2) + "T00:00:00.000Z";
      }
      else {
        this.selectedUnitModel.from = null;
      }

      // handle "to" date
      formValue = this.unitForm.get('to').value;
      if (formValue != null && formValue != '') {
        this.selectedUnitModel.to = formValue.substring(6, 10) + "-" + formValue.substring(3, 5) + "-" + formValue.substring(0, 2) + "T00:00:00.000Z";
      }
      else {
        this.selectedUnitModel.to = null;
      }

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
      if (this.mode == 'CLONE')
        unit.parentId = this.parentUnit.parentId;

      //handle "from" date
      let formValue: string = this.unitForm.get('from').value;
      if (formValue != null && formValue != '') {
        unit.from = formValue.substring(6, 10) + "-"
          + formValue.substring(3, 5) + "-"
          + formValue.substring(0, 2) + "T00:00:00.000Z";
      }
      else {
        unit.from = null;
      }

      //handle "to" date
      formValue = this.unitForm.get('to').value;
      if (formValue != null && formValue != '') {
        unit.to = formValue.substring(6, 10) + "-"
          + formValue.substring(3, 5) + "-"
          + formValue.substring(0, 2) + "T00:00:00.000Z";
      }
      else {
        unit.to = null;
      }

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

            this.unitUpdated.emit({mode: mode, changelogs: this.accumulatedChangeLogs, unit: unit});
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
      this.placeService.getLocationsByPttOrder(unit.address.pttOrder)
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

    // Retrieve country from cadi service
    if (unit.address != null && unit.address.countryId != null) {
      this.placeService.getCountryById(unit.address.countryId)
        .subscribe(
          (country) => {
            this.countrySelected(country);
          },
          (error) => {
            console.log('Unable to retrieve location');
            this.unitForm.get('addressCountryText').setValue('');
            this.unitForm.get('addressCountryId').setValue('');
          },
          () => { }
        );
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
    console.log("getSelectedChangeLogs");
    let JsonArrayOuput : string = '[ ';
    let selectedChangeLogsCpt : number = 0;
    for (let changeLog of this.changeLogs) {
      // If element is checked, then add it to the changeLogs list to pass to the changedoc component
      if ((<HTMLInputElement>document.getElementById('changeLogSelect_' + changeLog.id)).checked) {
        JsonArrayOuput += JSON.stringify(changeLog) + ',';
        selectedChangeLogsCpt++;
      }
    }
    JsonArrayOuput = JsonArrayOuput.substring(0, JsonArrayOuput.length - 1);
    JsonArrayOuput += ']';
    //console.log("JsonArrayOuput = " + JsonArrayOuput);
    if (selectedChangeLogsCpt > 0) {
      this.myChangeDocComponent.triggerCreateChangeDoc(JsonArrayOuput);
    }
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
    this.matchingParent = {"sigle": "", "label": ""};
    this.attributeEnumsList = [];
    this.changeAttachmentData = new FormData();
    this.accumulatedChangeLogs = [];
    this.searchReponsibleResults = [];
    this.searchLocationResults = [];
    this.searchCountryResults = [];
    this.fromUnit = new Unit({});
    this.selectedLocation = {};
    this.selectedCountry = {};

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
      parent: this.fb.control(''),
      position: this.fb.control(''),
      parentId: this.fb.control(''),
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

      /*
    this.treeService.getAttributes()
      .subscribe(
        (list) => {
          this.attributesList = list;
        },
        (error) => { console.log('error getting unit attributes'); },
        () => { }
      );*/
  }
}
