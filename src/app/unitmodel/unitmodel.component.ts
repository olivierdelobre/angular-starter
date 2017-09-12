import { Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ModalDirective, TabDirective } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import * as moment from 'moment';

import { TreeService } from '../services/units.service';
import { AuthService } from '../services/auth.service';
import { SciperService } from '../services/sciper.service';
import { CadiService } from '../services/cadi.service';
import { InfrastructureService } from '../services/infrastructure.service';

import { Unit } from '../model/unit.model';
import { UnitModel } from '../model/unitmodel.model';
import { Label } from '../model/label.model';
import { Attribute } from '../model/attribute.model';

@Component({
  selector: 'app-unitmodel',
  providers: [ TreeService, AuthService, SciperService, CadiService ],
  styleUrls: [ './unitmodel.style.css', '../app.style.css' ],
  templateUrl: './unitmodel.template.html',
  encapsulation: ViewEncapsulation.None
})
export class UnitModelComponent implements OnInit, OnDestroy {
  @ViewChild('handleUnitModelModal') modal: ModalDirective;

  @Output() unitModelDone: EventEmitter<UnitModel> = new EventEmitter<UnitModel>();
  @Output() messageTriggered: EventEmitter<any> = new EventEmitter<any>();
  
  public showView: boolean = false;
  public selectedUnitModel: UnitModel;
  public selectedUnitModelAttributes: Attribute[];
  public selectedUnitModelAttribute: Attribute;
  public unitModelExists: boolean = false;
  public attributeTempIdCounter: number = 1000000;
  public unitModelForm: FormGroup;
  public attributeModelForm: FormGroup;
  public labelENG: Label;
  public labelDEU: Label;
  public labelITA: Label;
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public stateDate: Date = new Date();
  public stateDateTemp: Date = new Date();
  public searchPersonQuery: string;
  public resultsPerson: any[];
  public resultsRoom: any[];
  public fromUnit: Unit;
  public matchingResponsible: any;
  public matchingRoom: any;
  public unitTypesList: any[];
  public languagesList: any[];
  public attributesList: any[];
  public unitHierarchy: any;
  public creationMode: string = "";
  
  constructor(public router: Router,
    public activatedRoute: ActivatedRoute,
    private treeService: TreeService,
    public fb: FormBuilder,
    public authService: AuthService,
    public sciperService: SciperService,
    public cadiService: CadiService,
    public infrastructureService: InfrastructureService
  ) {  }

  /******************************************************
  *   entry point for other components
  ******************************************************/
  public triggerUnitModel(unit: UnitModel, exists: boolean) {
    // console.log('handling unit Model form unit: ', unit);
    this.showView = true;
    this.selectedUnitModel = unit;
    this.unitModelExists = exists;
    this.unitHierarchy = null;

    this.buildForm(this.selectedUnitModel);

    this.modal.show();
  }

  /******************************************************
  *   show the attribute form panel
  ******************************************************/
  private showAttributeFormPanel(operation: string, attribute: Attribute, attributeType: any) {
    // console.log('selected attribute ' + JSON.stringify(attribute));

    if (operation == 'update' && attribute != null) {
      // console.log('update attribute ' + attribute.id);
      this.selectedUnitModelAttribute = attribute;

      let fromDateString: string = '';
      if (this.selectedUnitModelAttribute.from != null) {
        fromDateString = moment(this.selectedUnitModelAttribute.from).format('DD.MM.YYYY');
      }
      let toDateString: string = '';
      if (this.selectedUnitModelAttribute.to != null) {
        toDateString = moment(this.selectedUnitModelAttribute.to).format('DD.MM.YYYY');
      }

      this.attributeModelForm = this.fb.group({
        code: this.fb.control(this.selectedUnitModelAttribute.code, Validators.required),
        text: this.fb.control(this.selectedUnitModelAttribute.text, Validators.required),
        url: this.fb.control(this.selectedUnitModelAttribute.url),
        from: this.fb.control(fromDateString, Validators.required),
        to: this.fb.control(toDateString)
      });
    }
    
    if (operation == 'add') {
      // console.log('add attribute of type ' + attributeType.code);
      this.selectedUnitModelAttribute = new Attribute({});

      this.attributeModelForm = this.fb.group({
        code: this.fb.control(attributeType.code, Validators.required),
        text: this.fb.control('', Validators.required),
        url: this.fb.control(''),
        from: this.fb.control(moment().format('DD.MM.YYYY'), Validators.required),
        to: this.fb.control('')
      });
    }
  }

  /******************************************************
  *   cancel changed made to an attribute and close the attribute form panel
  ******************************************************/
  private hideAttributeFormPanel() {
    this.selectedUnitModelAttribute = null;
  }

  /******************************************************
  *   clear attribute "to" date
  ******************************************************/
  private clearAttributeToDate() {
    this.attributeModelForm.get('to').setValue('');
    this.selectedUnitModelAttribute.to = null;
  }

  /******************************************************
  *   save attribute (update existing or create new)
  ******************************************************/
  private saveAttribute() {
    this.selectedUnitModelAttribute.code = this.attributeModelForm.get('code').value;
    this.selectedUnitModelAttribute.text = this.attributeModelForm.get('text').value;
    this.selectedUnitModelAttribute.url = this.attributeModelForm.get('url').value;

    // Handle "from" date
    let formValue: string = this.attributeModelForm.get('from').value;
    console.log("save attribute from date = " + formValue);
      if (formValue != null && formValue != '') {
      this.selectedUnitModelAttribute.from = formValue.substring(6, 10) + "-" + formValue.substring(3, 5) + "-" + formValue.substring(0, 2) + "T00:00:00.000Z";
    }
    else {
      this.selectedUnitModelAttribute.from = null;
    }

    // handle "to" date
    formValue = this.attributeModelForm.get('to').value;
    if (formValue != null && formValue != '') {
      this.selectedUnitModelAttribute.to = formValue.substring(6, 10) + "-" + formValue.substring(3, 5) + "-" + formValue.substring(0, 2) + "T00:00:00.000Z";
    }
    else {
      this.selectedUnitModelAttribute.to = null;
    }

    // if it's an update of an existing attribute
    if (this.selectedUnitModelAttribute.id != null) {
      // console.log('Update attribute before ' + JSON.stringify(this.selectedUnitModelAttribute));
      // get the attribute from unit object
      let attributeTemp: Attribute = this.selectedUnitModel.attributes.filter((aAttribute) => aAttribute.id == this.selectedUnitModelAttribute.id)[0];
      attributeTemp.from = this.selectedUnitModelAttribute.from;
      attributeTemp.to = this.selectedUnitModelAttribute.to;
      attributeTemp.text = this.selectedUnitModelAttribute.text;
      attributeTemp.lang = this.selectedUnitModelAttribute.lang;
      attributeTemp.url = this.selectedUnitModelAttribute.url;
      // console.log('Update attribute ' + JSON.stringify(attributeTemp));
    }
    else {
      this.selectedUnitModelAttribute.id = this.attributeTempIdCounter++;
      this.selectedUnitModel.attributes.push(this.selectedUnitModelAttribute);
      // console.log('Insert attribute ' + JSON.stringify(this.selectedUnitModelAttribute));
      // to refresh display
      this.selectedUnitModel.attributes = this.selectedUnitModel.attributes.slice();
    }

    // console.log('Unit attributes are ' + JSON.stringify(this.selectedUnitModel.attributes));

    this.selectedUnitModelAttribute = null;
  }

  /******************************************************
  *   delete a unit's attribute
  ******************************************************/
  private deleteAttribute(attribute: Attribute) {
    console.log('Delete attribute ' + attribute.id);
    this.selectedUnitModel.attributes = this.selectedUnitModel.attributes.filter((attributeTemp) => attributeTemp.id != attribute.id);
  }

  /******************************************************
  *   autocomplete result for person search
  ******************************************************/
  private searchPerson(event) {
    // this.resultsPerson = this.sciperService.searchByName(event.query);
    this.sciperService.searchByName(event.query)
      .subscribe(
        (people) => this.resultsPerson = people,
        (error) => console.log('error retrieving people from sciper service')
    );
  }

  /******************************************************
  *   clear responsible in form
  ******************************************************/
  private clearResponsible() {
    this.unitModelForm.get('responsible').setValue('');
    this.unitModelForm.get('responsibleId').setValue(0);
  }

  /******************************************************
  *   a person is selected in the autocomplete select
  ******************************************************/
  private personSelected(event) {
    this.unitModelForm.get('responsibleId').setValue(event.id);
    console.log("person selected " + event.id);
  }

  /******************************************************
  *   autocomplete result for room search
  ******************************************************/
  private searchRoom(event) {
    this.infrastructureService.searchRoomsByLabel(event.query)
      .subscribe(
        (rooms) => this.resultsRoom = rooms,
        (error) => console.log('error retrieving rooms from cadi service')
    );
  }

  /******************************************************
  *   clear room in form
  ******************************************************/
  private clearRoom() {
    this.unitModelForm.get('room').setValue('');
    this.unitModelForm.get('roomId').setValue(0);
  }

  /******************************************************
  *   a room is selected in the autocomplete select
  ******************************************************/
  private roomSelected(event) {
    this.unitModelForm.get('roomId').setValue(event.id);
    console.log("room selected " + event.id);
  }

  /******************************************************
  *   clear unit "valid to" date
  ******************************************************/
  private clearValidTo() {
    this.unitModelForm.get('to').setValue('');
  }

  /******************************************************
  *   build the update unit form
  ******************************************************/
  private buildForm(unit: UnitModel) {
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
    this.unitModelForm = this.fb.group({
      label: this.fb.control(unit.label, [Validators.maxLength(80)]),
      sigle: this.fb.control(unit.sigle, [Validators.maxLength(12)]),
      labelShort: this.fb.control(unit.labelShort, [Validators.maxLength(40)]),
      type: this.fb.control(unit.type),
      lang: this.fb.control(unit.lang),
      cfNumber: this.fb.control({ value: unit.cfNumber, disabled: true }),
      cf: this.fb.control(unit.cf, [Validators.minLength(4), Validators.maxLength(5)]),
      from: this.fb.control(unit.from == null ? '':moment(unit.from).format('DD.MM.YYYY')),
      to: this.fb.control(unit.to == null ? '':moment(unit.to).format('DD.MM.YYYY')),
      responsible: this.fb.control(''),
      responsibleId: this.fb.control(unit.responsibleId),
      position: this.fb.control(unit.position),
      room: this.fb.control(''),
      roomId: this.fb.control(unit.roomId),
      isTemporary: this.fb.control(unit.isTemporary),
      labelEn: this.fb.control(this.labelENG.label),
      labelGe: this.fb.control(this.labelDEU.label),
      labelIt: this.fb.control(this.labelITA.label),
      labelShortEn: this.fb.control(this.labelENG.labelShort),
      labelShortGe: this.fb.control(this.labelDEU.labelShort),
      labelShortIt: this.fb.control(this.labelITA.labelShort)
    });

    // retrieve responsible from sciper service
    if (unit.responsibleId != null && unit.responsibleId != 0) {
      this.sciperService.getById(unit.responsibleId)
        .subscribe(
          (person) => {
            this.matchingResponsible = person;
            this.unitModelForm.get('responsible').setValue(this.matchingResponsible.displayname);
          },
          (error) => {
            console.log('Unable to retrieve responsible');
            this.unitModelForm.get('responsible').setValue('');
            this.unitModelForm.get('responsibleId').setValue('');
          },
          () => { }
        );
    }

    // retrieve room from cadi service
    if (unit.roomId != null && unit.roomId != 0) {
      this.infrastructureService.getRoomById(unit.roomId)
        .subscribe(
          (room) => {
            this.matchingRoom = room;
            this.unitModelForm.get('room').setValue(this.matchingRoom.label);
          },
          (error) => {
            console.log('Unable to retrieve room');
            this.unitModelForm.get('room').setValue('');
            this.unitModelForm.get('roomId').setValue('');
          },
          () => { }
        );
    }

    // retrieve unit on which is based the model
    this.treeService.getUnitById(unit.id)
      .subscribe(
        unit => {
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
    this.selectedUnitModelAttributes = unit.attributes;
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
  *   save a unit Model (update or create)
  ******************************************************/
  private saveUnitModel(unit: UnitModel) {
    unit.id = this.selectedUnitModel.id;

    // handle "from" date
    let formValue: string = this.unitModelForm.get('from').value;
      if (formValue != null && formValue != '') {
      this.selectedUnitModel.from = formValue.substring(6, 10) + "-" + formValue.substring(3, 5) + "-" + formValue.substring(0, 2) + "T00:00:00.000Z";
    }
    else {
      this.selectedUnitModel.from = null;
    }

    // handle "to" date
    formValue = this.unitModelForm.get('to').value;
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
    this.selectedUnitModel.cfNumber = unit.cfNumber;
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
      label.label = this.unitModelForm.get('labelEn').value;
      label.labelShort = this.unitModelForm.get('labelShortEn').value;
    }
    else if (this.unitModelForm.get('labelEn').value != '') {
      label = new Label("{}");
      label.lang = 'ENG';
      label.label = this.unitModelForm.get('labelEn').value;
      label.labelShort = this.unitModelForm.get('labelShortEn').value;
      this.selectedUnitModel.labels.push(label);
    }

    // DEU label
    label = null;
    if (this.selectedUnitModel.labels != null) {
      label = this.selectedUnitModel.labels.filter((item) => item.lang == 'DEU')[0];
    }
    if (label != null) {
      label.label = this.unitModelForm.get('labelGe').value;
      label.labelShort = this.unitModelForm.get('labelShortGe').value;
    }
    else if (this.unitModelForm.get('labelGe').value != '') {
      label = new Label("{}");
      label.lang = 'DEU';
      label.label = this.unitModelForm.get('labelGe').value;
      label.labelShort = this.unitModelForm.get('labelShortGe').value;
      this.selectedUnitModel.labels.push(label);
    }

    // ITA label
    label = null;
    if (this.selectedUnitModel.labels != null) {
      label = this.selectedUnitModel.labels.filter((item) => item.lang == 'ITA')[0];
    }
    if (label != null) {
      label.label = this.unitModelForm.get('labelIt').value;
      label.labelShort = this.unitModelForm.get('labelShortIt').value;
    }
    else if (this.unitModelForm.get('labelIt').value != '') {
      label = new Label("{}");
      label.lang = 'ITA';
      label.label = this.unitModelForm.get('labelIt').value;
      label.labelShort = this.unitModelForm.get('labelShortIt').value;
      this.selectedUnitModel.labels.push(label);
    }

    console.log('you submitted unit: ', this.selectedUnitModel);

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
                this.showView = false;
                this.modal.hide();
                let errorBody = JSON.parse(error._body);
                this.messageTriggered.emit({ message: 'Erreur lors de la création de l\'unité modèle', level: 'danger' });
              },
              () => {
                console.log("updating unit model finished");
                this.showView = false;
                this.modal.hide();
                this.unitModelDone.emit(this.selectedUnitModel);
                this.messageTriggered.emit({ message: 'Unité modèle créée avec succès', level: 'success' });
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
                this.showView = false;
                this.modal.hide();
                let errorBody = JSON.parse(error._body);
                this.messageTriggered.emit({ message: 'Erreur lors de la création de l\'unité modèle', level: 'danger' });
              },
              () => {
                console.log("creating unit model finished");
                this.showView = false;
                this.modal.hide();
                this.unitModelDone.emit(this.selectedUnitModel);
                this.messageTriggered.emit({ message: 'Unité modèle créée avec succès', level: 'success' });
              }
            );
        },
        () => {

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
  *   calculate value for "CF Number" when something
  *   is types in "CF"
  ******************************************************/
  private setCfNumber() {
    let cfInt: number = +this.unitModelForm.get('cf').value;
    this.unitModelForm.get('cfNumber').setValue(cfInt);
  }

  /******************************************************
  *   on destroy
  ******************************************************/
  public ngOnDestroy() {
    // console.log('ngOnDestroy `Tree` component');
  }

  /******************************************************
  *   on init
  ******************************************************/
  public ngOnInit() {
    this.selectedUnitModel = new UnitModel({});
    this.selectedUnitModelAttributes = [];
    this.unitHierarchy = {};

    this.labelENG = new Label("{}");
    this.labelDEU = new Label("{}");
    this.labelITA = new Label("{}");

    this.unitModelForm = this.fb.group({
      label: this.fb.control(''),
      sigle: this.fb.control(''),
      labelShort: this.fb.control(''),
      type: this.fb.control(''),
      lang: this.fb.control(''),
      cfNumber: this.fb.control(''),
      cf: this.fb.control(''),
      from: this.fb.control(''),
      to: this.fb.control(''),
      applyAt: this.fb.control(''),
      responsible: this.fb.control(''),
      responsibleId: this.fb.control(''),
      position: this.fb.control(''),
      room: this.fb.control(''),
      roomId: this.fb.control(''),
      isTemporary: this.fb.control(''),
      labelEn: this.fb.control(''),
      labelGe: this.fb.control(''),
      labelIt: this.fb.control(''),
      labelShortEn: this.fb.control(''),
      labelShortGe: this.fb.control(''),
      labelShortIt: this.fb.control('')
    });

    this.attributeModelForm = this.fb.group({
      code: this.fb.control('', Validators.required),
      text: this.fb.control('', Validators.required),
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
      
    this.fromUnit = new Unit({});
  }
}
