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
  selector: 'app-changedoc',
  providers: [ TreeService, AuthService ],
  styleUrls: [ './changedoc.style.css', '../app.style.css' ],
  templateUrl: './changedoc.template.html',
  encapsulation: ViewEncapsulation.None /* required to be able to override primeNG styles */
})
export class ChangeDocComponent implements OnInit, OnDestroy {
  @ViewChild('changeDocModal') modal: ModalDirective;
  @ViewChild('fileUploadInput') fileUploadInput: any;
  @ViewChild('alertsModal') alertsModal: ModalDirective;

  @Output() changeDocCreated: EventEmitter<Unit> = new EventEmitter<Unit>();
  @Output() messageTriggered: EventEmitter<any> = new EventEmitter<any>();
  
  public showView: boolean = false;
  public changeLogs: ChangeLog[];
  public unitPlanned: UnitPlanned;
  public updateResponseContent: any;
  public changeDocForm: FormGroup;
  public loggedUserInfo: any;
  public loggedUserInfoSubscription: Subscription;  
  public changeAttachmentData: FormData;
  public deleteAttachementFileFlag: boolean = false;
  private selectedUnit: Unit;
  private filename: string;

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
  public triggerCreateChangeDoc(unit: Unit, changeLogs: string) {
    // console.log('changeLogs in ChangeDocComponent = ' + changeLogs);
    this.changeLogs = JSON.parse(changeLogs);
    this.unitPlanned = null;
    this.selectedUnit = unit;
    // console.log('this.changeLogs.length = ', this.changeLogs.length);
    this.changeAttachmentData = new FormData();
    this.deleteAttachementFileFlag = false;
    this.showView = true;
    this.buildForm();
    this.modal.show();
  }

  /******************************************************
  *   entry point for other components
  ******************************************************/
  public triggerCreateChangeDocForUnitPlanned(unitPlanned: UnitPlanned) {
    this.changeLogs = [];
    this.unitPlanned = unitPlanned;
    this.changeAttachmentData = new FormData();
    this.deleteAttachementFileFlag = false;
    this.showView = true;
    this.buildForm();
    this.modal.show();
  }

  /******************************************************
  *   build the changedoc form
  ******************************************************/
  private buildForm() {
    if (this.unitPlanned != null) {
      this.changeDocForm = this.fb.group({
        changeDescription: this.fb.control(this.unitPlanned.attachmentDescription)
      });
    }
    else {
      this.changeDocForm = this.fb.group({
        changeDescription: this.fb.control('', Validators.required)
      });
    }
  }

  /******************************************************
  *   Check document  validity (if it already exists)
  ******************************************************/
  private checkChangeDoc(formData: any) {
    // console.log("Checking changedoc");

    this.treeService.searchChangeLogAttachments(this.filename).subscribe(
      (res) => {
        if (res.length > 0) {
          this.closeModal();
          this.alertsModal.show();
        }
        else {
          this.handleChangeDoc(formData);
        }
      },
      (error) => {
        console.log("Error search ChangeLogAttachment");
      },
      () => { }
    );
  }
  
  /******************************************************
  *   Handle changes documentation
  ******************************************************/
  private handleChangeDoc(formData: any) {
    // console.log("Creating changedoc for Unit...");

    // Create the change attachment
    this.changeAttachmentData.append('changes', JSON.stringify(this.changeLogs));
    this.changeAttachmentData.append('description', this.changeDocForm.get("changeDescription").value);
      
    this.treeService.patchChangeLogs(this.selectedUnit, this.changeAttachmentData).subscribe(
      (res) => {
        console.log("Change attachment created successfully");
      },
      (error) => {
        console.log("Error creating change attachment");
      },
      () => {
        this.closeModal();
        this.alertsModal.hide();
        this.changeDocCreated.emit(formData);
        //this.messageTriggered.emit({ message: 'Documentation créée avec succès', level: 'success' });
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
  *   file changed in the form, store data locally
  ******************************************************/
  private fileChange(event) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
        let file: File = fileList[0];
        this.filename = file.name;
        this.changeAttachmentData = new FormData();
        this.changeAttachmentData.append('file', file, file.name);
        this.changeDocForm.get("changeDescription").clearValidators();
        this.changeDocForm.get("changeDescription").updateValueAndValidity();
    }
  }

  /******************************************************
  *   clear file input
  ******************************************************/
  private clearFile() {
    this.changeAttachmentData = new FormData();
    this.fileUploadInput.nativeElement.value = "";
    
    if (this.unitPlanned == null) {
      this.changeDocForm.get("changeDescription").setValidators(Validators.required);
      this.changeDocForm.get("changeDescription").updateValueAndValidity();
    }
  }

  /******************************************************
  *   set flag to delete attachment file to true
  ******************************************************/
  private setDeleteAttachementFileFlag() {
    //this.changeDocForm.get("changeDescription").setValidators(Validators.required);
    //this.changeDocForm.get("changeDescription").updateValueAndValidity();

    this.deleteAttachementFileFlag = true;
    this.unitPlanned.attachmentFilename = null;
  }

  /******************************************************
  *   get changelog attachment file
  ******************************************************/
  private getAttachment(id: number) {
    let url: string;
    url = this.treeService.getChangeLogAttachmentUrl();
    url += '/' + id;      
    
    window.location.href = url;
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
