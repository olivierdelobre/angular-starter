import { Component, ViewEncapsulation, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TabDirective } from 'ngx-bootstrap';

import {Observable} from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/forkJoin';

import { TreeService } from '../services/units.service';
import { AuthService } from '../services/auth.service';
import { SciperService } from '../services/sciper.service';
import { CadiService } from '../services/cadi.service';
import { PlaceService } from '../services/place.service';
import { RealEstateService } from '../services/realestate.service';
import { SharedAppStateService } from '../services/sharedappstate.service';

import { Unit } from '../model/unit.model';
import { Label } from '../model/label.model';
import { Attribute } from '../model/attribute.model';
import { UnitType } from '../model/unittype.model';
import { UnitLang } from '../model/unitlang.model';
import { Address } from '../model/address.model';

import { Utils } from '../common/utils';

@Component({
  selector: 'app-displayunit',
  providers: [ TreeService, AuthService, SciperService, CadiService, PlaceService, RealEstateService ],
  styleUrls: [ './displayunit.style.css', '../app.style.css' ],
  templateUrl: './displayunit.template.html',
  encapsulation: ViewEncapsulation.None
})
export class DisplayUnitComponent implements OnInit, OnDestroy {
 
  private unitId: number;
  private selectedUnit: Unit;
  private selectedUnitAttributes: Attribute[];
  private selectedParentUnit: any;
  private labelENG: Label;
  private labelDEU: Label;
  private labelITA: Label;
  private unitHierarchy: any;
  private selectedResponsible: any;
  private selectedRoom: any;
  private selectedUnitAddress: string;
  private unitTypesList: UnitType[];
  private languagesList: UnitLang[];
  private attributesList: any[];
  private loggedUserInfo: any;
  private loggedUserInfoSubscription: Subscription;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private unitService: TreeService,
    private authService: AuthService,
    private sciperService: SciperService,
    private cadiService: CadiService,
    private placeService: PlaceService,
    private realEstateService: RealEstateService,
    private sharedAppStateService: SharedAppStateService
  ) {  }

  /******************************************************
  *   Get root unit sigle
  ******************************************************/
  private getRootSigle(hierarchy: string) {
    if (hierarchy != null) {
      return hierarchy.split('|')[0];
    }
    return null;
  }

  private getUnitTypeLabel(unit: Unit) {
    let filteredUnitTypes : Array<UnitType> = this.unitTypesList.filter((unitType) => unitType.code == unit.type);
    if (filteredUnitTypes.length > 0) {
      return filteredUnitTypes[0].label;
    }
  }

  private getUnitLangLabel(unit: Unit) {
    let filteredUnitLangs : Array<UnitType> = this.languagesList.filter((lang) => lang.code == unit.lang);
    if (filteredUnitLangs.length > 0) {
      return filteredUnitLangs[0].label;
    }
  }

  /******************************************************
  *   destroy component
  ******************************************************/
  public ngOnDestroy() {
    if (this.loggedUserInfoSubscription != null) {
      this.loggedUserInfoSubscription.unsubscribe();
    }
  }

  /******************************************************
  *   init component
  ******************************************************/
  public ngOnInit() {
    this.loggedUserInfo = { "username": "", "uniqueid": 0, "scopes": "" };
    this.loggedUserInfoSubscription = this.sharedAppStateService.loggedUserInfo.subscribe(
      (info) => {
        this.loggedUserInfo = info;
        if (!this.authService.isLoggedIn()) {
          console.log("route = " + this.router.url);
          localStorage.setItem('targetUrl', this.router.url);
          this.authService.redirectToLogin();
        }
      },
      (error) => {},
      () => {}
    );

    let sub: any;
    this.selectedUnit = new Unit({});
    this.selectedUnitAttributes = [];
    this.selectedParentUnit = {"sigle": "", "label": ""};
    this.labelENG = new Label("{}");
    this.labelDEU = new Label("{}");
    this.labelITA = new Label("{}");
    this.selectedRoom = {"label": ""};
    this.unitHierarchy = {};
    this.selectedUnitAddress = '';
    this.unitTypesList = [];
    this.languagesList = [];
    this.attributesList = [];

    console.log('loggedUserInfo = ' + JSON.stringify(this.loggedUserInfo));
    console.log('authService.hasSuperAdminRole = ' + this.authService.hasSuperAdminRole(this.loggedUserInfo));
    console.log('authService.hasReadRole = ' + this.authService.hasReadRole(this.loggedUserInfo));

    sub = this.route.params.subscribe((params) => {
      this.unitId = params['unitId'];
      this.unitService.getUnitById(this.unitId, true)
        .subscribe(
          (unit) => {
            this.selectedUnit = unit;
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
            // Get parent unit
            this.unitService.getUnitById(unit.parentId)
              .subscribe(
                (parentUnit) => {
                  this.selectedParentUnit = parentUnit;
                },
                (error) => {
                  console.log('Unable to retrieve parent unit');
                },
                () => { }
              );
            // Get responsible
            this.sciperService.getById(unit.responsibleId)
              .subscribe(
                (person) => {
                  this.selectedResponsible = person;
                },
                (error) => {
                  console.log('Unable to retrieve responsible');
                },
                () => { }
              );
            // Get room info
            this.realEstateService.getRoomById(unit.roomId)
              .subscribe(
                (room) => {
                  this.selectedRoom = room;
                },
                (error) => {
                  console.log('Unable to retrieve room');
                },
                () => { }
              );
            // Get address
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
          },
          (error) => {
            console.log('Unable to retrieve unit');
          },
          () => { }
        );
      this.unitService.getUnitHierarchy(this.unitId)
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
            this.unitService.getAttributes(rootUnitSigle)
              .subscribe(
                (list) => {
                  this.attributesList = list;
                },
                (error) => { console.log('Error getting unit attributes'); },
                () => { }
              );
          }
        );
    });

    this.unitService.getUnitTypes()
      .subscribe(
        (list) => {
          this.unitTypesList = list;
        },
        (error) => { console.log('error getting unit types'); },
        () => { }
      );

    this.unitService.getUnitLangs()
      .subscribe(
        (list) => {
          this.languagesList = list;
        },
        (error) => { console.log('error getting unit langs'); },
        () => { }
      );
  }
}
