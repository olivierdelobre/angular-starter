import { Label } from './label.model';
import { ChangeLog } from './changelog.model';
import { Attribute } from './attribute.model';
import { Address } from './address.model';

export class Unit {
    public static fromJSONArray(array: Array<Object>): Unit[] {
        return array.map((obj) => new Unit(obj));
    }

    public id: number;
    public isTemporary: boolean;
    public from: string;
    public to: string;
    public sigle: string;
    public sigleAndLabel: string;
    public label: string;
    public labelShort: string;
    public parentId: number;
    public type: string;
    public lang: string;
    public cfNumber: number;
    public cf: string;
    public orderNo: number;
    public isEpfl: boolean;
    public longSigle: string;
    public level: number;
    public position: number;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date;
    public updatedBy: string;
    public responsibleId: number;
    public roomId: number;
    public zipcode: number;
    public station: string;   
    public icon: string;
    public expanded: boolean;
    public showIcon: boolean;
    public childrenCount: number;
    public isValid: boolean;
    public labels: Label[];
    public attributes: Attribute[];
    public changeLogs: ChangeLog[];
    public hasUnitPlanned: boolean;
    public hasUnitModel: boolean;
    public address: Address;

    constructor(obj: Object) {
        this.id = obj['id'];
        this.isTemporary = obj['isTemporary'];
        this.from = obj['from'];
        this.to = obj['to'];
        this.sigle = obj['sigle'];
        this.sigleAndLabel = obj['sigle'] + ' / ' + obj['label'];
        this.label = obj['label'];
        this.labelShort = obj['labelShort'];
        this.parentId = obj['parentId'];
        this.type = obj['type'];
        this.lang = obj['lang'];
        this.cfNumber = obj['cfNumber'];
        this.cf = obj['cf'];
        this.orderNo = obj['orderNo'];
        this.isEpfl = obj['isEpfl'];
        this.longSigle = obj['longSigle'];
        this.level = obj['level'];
        this.position = obj['position'];
        this.createdAt = obj['createdAt'];
        this.createdBy = obj['createdBy'];
        this.updatedAt = obj['updatedAt'];
        this.updatedBy = obj['updatedBy'];
        this.responsibleId = obj['responsibleId'];
        this.roomId = obj['roomId'];
        this.zipcode = obj['zipcode'];
        this.station = obj['station'];
        this.childrenCount = obj['childrenCount'];
        this.isValid = obj['isValid'];
        this.expanded = false;
        this.showIcon = true;
        this.icon = this.getIcon();
        this.labels = obj['labels'];
        this.attributes = obj['attributes'];
        this.changeLogs = obj['changeLogs'];
        this.hasUnitPlanned = obj['hasUnitPlanned'];
        this.hasUnitModel = obj['hasUnitModel'];
        this.address = obj['address'];
    }

    public expand() {
        if (this.childrenCount > 0) {
            this.expanded = !this.expanded;
            this.icon = this.getIcon();
        }
    }

    private getIcon() {
        if (this.showIcon === true) {
            if (this.expanded){
                return 'glyphicon-chevron-down';
            }
            return 'glyphicon-chevron-right';
        }
        return null;
    }
}
