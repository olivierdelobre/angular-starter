import { Injectable } from '@angular/core';
import { Http, Response, Headers, ResponseContentType } from '@angular/http';

import { Unit } from '../model/unit.model';
import { UnitPlanned } from '../model/unitplanned.model';
import { UnitModel } from '../model/unitmodel.model';
import { Label } from '../model/label.model';
import { Attribute } from '../model/attribute.model';
import { UnitType } from '../model/unittype.model';
import { UnitAttribute } from '../model/unitattribute.model';
import { UnitAttributeEnum } from '../model/unitattributeenum.model';
import { UnitLang } from '../model/unitlang.model';
import { ChangeLog } from '../model/changelog.model';

import 'rxjs/add/operator/map';

import * as FileSaver from 'file-saver';

@Injectable()
export class TreeService {

    // private static readonly SERVICE_PREFIX = process.env.UNITS_API_URL;
    // private static readonly SERVICE_PREFIX = 'http://idevelopsrv1.epfl.ch:6081/idm/v1/';
     private static readonly SERVICE_PREFIX = 'http://localhost:8080/units-api/v1/';
    // private static readonly SERVICE_PREFIX = 'http://idevelopsrv1.epfl.ch:8081/units-api/v1/';
    // private static readonly SERVICE_PREFIX = 'http://uatesb5.epfl.ch:9092/units-api/v1/';

    constructor(private http: Http) { }

    /******************************************************
    *   get children units of a given parent
    ******************************************************/
    public getUnitByParent(parentId: number, onlyPermanent: Boolean, onlyValid: Boolean, stateDate: string) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'units?parentId=' + parentId;
        if (onlyPermanent) {
            url += '&onlyPermanent=Y';
        }
        else {
            url += '&onlyPermanent=N';
        }

        if (onlyValid) {
            url += '&onlyValid=Y';
        }
        else {
            url += '&onlyValid=N';
        }

        url += '&stateDate=' + stateDate.slice(0,10).replace(/-/g,'');

        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => Unit.fromJSONArray(res.json()));
            // .map((res: Response) => res.json());
    }

    /******************************************************
    *   get a specific unit
    ******************************************************/
    public getUnitById(id: number) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'units/' + id + '?withlabels&withattributes';

        // console.log("calling " + url);
        return this.http.get(url, { headers: headers })
            .map((res) => new Unit(res.json()));
            //.map((res: Response) => res.json());
    }

    /******************************************************
    *   get a specific unit planned
    ******************************************************/
    public getUnitPlannedById(id: number) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'unitplanneds/' + id + '?withlabels&withattributes';

        // console.log("calling " + url);
        return this.http.get(url, { headers: headers })
            .map((res) => new UnitPlanned(res.json()));
            // .map((res: Response) => res.json());
    }

    /******************************************************
    *   get a all UnitPlanneds for a given unit
    ******************************************************/
    public getUnitPlannedsForUnitId(unitId: number) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'units/' + unitId + '/unitplanneds?withlabels&withattributes';

        // console.log("calling " + url);
        return this.http.get(url, { headers: headers })
            .map((res) => UnitPlanned.fromJSONArray(res.json()));
            // .map((res: Response) => res.json());
    }

    /******************************************************
    *   get a specific unit model
    ******************************************************/
    public getUnitModelById(id: number) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'unitsmodel/' + id + '?withlabels&withattributes';

        // console.log("calling " + url);
        return this.http.get(url, { headers: headers })
            .map((res) => new UnitModel(res.json()));
            // .map((res: Response) => res.json());
    }

    /******************************************************
    *   get a unit's change logs
    ******************************************************/
    public getUnitChangeLogs(id: number) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'units/' + id + '/changelogs';

        return this.http.get(url, { headers: headers })
            .map((res) => ChangeLog.fromJSONArray(res.json()));
    }

    /******************************************************
    *   get a unit's hierarchy
    ******************************************************/
    public getUnitHierarchy(id: number) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'units/' + id + '/hierarchy';

        return this.http.get(url, { headers: headers })
            .map((res) => res.json());
    }

    /******************************************************
    *   update a unit
    ******************************************************/
    public updateUnit(unit: Unit) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        return this.http.put(TreeService.SERVICE_PREFIX + 'units/' + unit.id,
            unit,
            { headers: headers })
            .map((res: Response) => res.text());
    }

    /******************************************************
    *   update a unit planned
    ******************************************************/
    public updateUnitPlanned(unit: UnitPlanned) {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        return this.http.put(TreeService.SERVICE_PREFIX + 'unitplanneds/' + unit.id,
            unit,
            { headers: headers })
            .map((res) => res);
    }

    /******************************************************
    *   update a unit model
    ******************************************************/
    public updateUnitModel(unit: UnitModel) {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        return this.http.put(TreeService.SERVICE_PREFIX + 'unitsmodel/' + unit.id,
            unit,
            { headers: headers })
            .map((res) => res);
    }

    /******************************************************
    *   create a unit
    ******************************************************/
    public createUnit(unit: Unit) {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        // console.log('you submitted unit for creation: ', unit);

        return this.http.post(TreeService.SERVICE_PREFIX + 'units/',
            unit,
            { headers: headers })
            .map((res: Response) => res);
    }

    /******************************************************
    *   create a unit planned
    ******************************************************/
    public createUnitPlanned(unit: UnitPlanned) {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        return this.http.post(TreeService.SERVICE_PREFIX + 'unitplanneds/',
            unit,
            { headers: headers })
            .map((res) => res);
    }

    /******************************************************
    *   create a unit model
    ******************************************************/
    public createUnitModel(unit: UnitModel) {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        return this.http.post(TreeService.SERVICE_PREFIX + 'unitsmodel/',
            unit,
            { headers: headers })
            .map((res) => res);
    }

    /******************************************************
    *   Patch a set of ChangeLogs
    ******************************************************/
    public patchChangeLogs(unit: Unit, data: any) {
        let headers = new Headers();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        return this.http.patch(TreeService.SERVICE_PREFIX+ 'units/' + unit.id + '/changelogs',
            data,
            { headers: headers })
            .map((res) => res);
    }

    /******************************************************
    *   update UnitPlanned attachment
    ******************************************************/
    public updateUnitPlannedAttachment(id: number, data: any) {
        let headers = new Headers();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        return this.http.post(TreeService.SERVICE_PREFIX + 'unitplanneds/' + id + '/unitschangelogattachments',
            data,
            { headers: headers })
            .map((res) => res);
    }

    /******************************************************
    *   delete a unit
    ******************************************************/
    public deleteUnit(unit: Unit) {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'units/' + unit.id;

        // console.log("calling " + url);

        return this.http.delete(url, { headers: headers })
            .map((res) => res);
    }

    /******************************************************
    *   delete a unit planned
    ******************************************************/
    public deleteUnitPlanned(unit: UnitPlanned) {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'unitplanneds/' + unit.id;

        // console.log("calling " + url);

        return this.http.delete(url, { headers: headers })
            .map((res) => res);
    }

    /******************************************************
    *   delete a unit model
    ******************************************************/
    public deleteUnitModel(unit: UnitModel) {
        let headers = new Headers();
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'unitsmodel/' + unit.id;

        // console.log("calling " + url);

        return this.http.delete(url, { headers: headers })
            .map((res) => res);
    }

    /******************************************************
    *   search for units from single query
    ******************************************************/
    public searchUnitsGeneric(query: string, level: number) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'units/searchgeneric?do=1&query=' + query + "&level=" + level;

        return this.http.get(url, { headers: headers })
            .map((res) => Unit.fromJSONArray(res.json()));
    }

    /******************************************************
    *   search for units
    ******************************************************/
    public searchUnits(sigle: string,
            label: string,
            cf: string,
            type: string,
            level: string,
            responsibleId: number,
            createdAtStart: string,
            createdAtEnd: string,
            updatedAtStart: string,
            updatedAtEnd: string,
            onlyPermanent: string,
            onlyValid: string,
            attributesCriterias: any[]) {
        
        let headers = new Headers();
        headers.append('Accept', 'application/json');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'units/search?do=1';
        if (sigle != null) {
            url += '&sigle=' + sigle;
        }
        if (label != null) {
            url += '&label=' + label;
        }
        if (cf != null) {
            url += '&cf=' + cf;
        }
        if (type != null) {
            url += '&type=' + type;
        }
        if (level != null) {
            url += '&level=' + level;
        }
        if (responsibleId != null) {
            url += '&responsibleId=' + responsibleId;
        }
        if (createdAtStart != null) {
            url += '&createdAtStart=' + createdAtStart;
        }
        if (createdAtEnd != null) {
            url += '&createdAtEnd=' + createdAtEnd;
        }
        if (updatedAtStart != null) {
            url += '&updatedAtStart=' + updatedAtStart;
        }
        if (updatedAtEnd != null) {
            url += '&updatedAtEnd=' + updatedAtEnd;
        }
        if (onlyPermanent) {
            url += '&onlyPermanent=Y';
        }
        else {
            url += '&onlyPermanent=N';
        }

        if (onlyValid) {
            url += '&onlyValid=Y';
        }
        else {
            url += '&onlyValid=N';
        }
        if (attributesCriterias != null && attributesCriterias.length > 0) {
            let attributesCriteriasString: string = "";
            for (let criteria of attributesCriterias) {
                attributesCriteriasString += "|" + criteria.code + ":" + criteria.value;
            }
            url += '&attributes=' + attributesCriteriasString.substr(1);
        }

        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => Unit.fromJSONArray(res.json()));
    }

    /******************************************************
    *   search for units tree
    ******************************************************/
    public searchUnitsTree(searchString: string,
            onlyPermanent: string,
            onlyValid: string) {
        
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'unitssearchtrees?do=1';
        if (searchString != null) {
            url += '&searchString=' + searchString;
        }

        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => Unit.fromJSONArray(res.json()));
    }

    /******************************************************
    *   get the export endpoint Url
    ******************************************************/
    public getExportUrl() {
        return TreeService.SERVICE_PREFIX + 'unitsexports?do=1';
    }

    /******************************************************
    *   get the changelog attachment url
    ******************************************************/
    public getChangeLogAttachmentUrl() {
        return TreeService.SERVICE_PREFIX + 'unitschangelogattachments';
    }
    public downloadChangeLogAttachment(id: number, filename: string){
        let headers = new Headers();
        let fileContent: any;
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));

        let url = TreeService.SERVICE_PREFIX + 'unitschangelogattachments/' + id;
        // console.log('Calling ' + url);

        return this.http.get(url, { responseType: ResponseContentType.Blob, headers: headers })
            .subscribe(
                (response: any) => {                   
                    FileSaver.saveAs(response.blob(), filename);
                },
                (error) => console.log('Error retrieving file')
            );
    }

    /******************************************************
    *   get the unit types to display in the forms
    ******************************************************/
    public getUnitTypes() {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'unitstypes';

        return this.http.get(url, { headers: headers })
            .map((res) => UnitType.fromJSONArray(res.json()));
    }

    /******************************************************
    *   get the unit langs to display in the forms
    ******************************************************/
    public getUnitLangs() {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'unitslangs';

        return this.http.get(url, { headers: headers })
            .map((res) => UnitLang.fromJSONArray(res.json()));
    }

    /******************************************************
    *   get the unit attributes to display in the forms
    ******************************************************/
    public getAttributes(rootUnitSigle: string) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'unitsattributes?rootUnitSigle=' + rootUnitSigle;

        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => UnitAttribute.fromJSONArray(res.json()));
    }

    /******************************************************
    *   get attribute enums for a given code
    ******************************************************/
    public getAttributeEnums(code: string) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');

        let url: string;
        url = TreeService.SERVICE_PREFIX + 'unitsattributeenums/' + code;

        return this.http.get(url, { headers: headers })
            .map((res) => UnitAttributeEnum.fromJSONArray(res.json()));
    }
}
