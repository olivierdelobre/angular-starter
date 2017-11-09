import { Label } from './label.model';
import { Unit } from './unit.model';
import { Attribute } from './attribute.model';
import { Address } from './address.model';

export class UnitPlanned {
    public static fromJSONArray(array: Array<Object>): UnitPlanned[] {
        return array.map((obj) => new UnitPlanned(obj));
    }

    public static fromUnit(unit: Unit) {
        let unitPlanned = new UnitPlanned({});
        unitPlanned.cf = unit.cf;
        unitPlanned.cfNumber = unit.cfNumber;
        unitPlanned.unitId = unit.id;
        unitPlanned.isEpfl = unit.isEpfl;
        unitPlanned.isTemporary = unit.isTemporary;
        unitPlanned.isValid = unit.isValid;
        unitPlanned.from = unit.from;
        unitPlanned.to = unit.to;
        unitPlanned.label = unit.label;
        unitPlanned.labelShort = unit.labelShort;
        unitPlanned.lang = unit.lang;
        unitPlanned.level = unit.level;
        unitPlanned.sigleLong = unit.sigleLong;
        unitPlanned.parentId = unit.parentId;
        unitPlanned.position = unit.position;
        unitPlanned.responsibleId = unit.responsibleId;
        unitPlanned.roomId = unit.roomId;
        unitPlanned.sigle = unit.sigle;
        unitPlanned.station = unit.station;
        unitPlanned.type = unit.type;
        unitPlanned.zipcode = unit.zipcode;
        unitPlanned.labels = unit.labels;
        unitPlanned.attributes = unit.attributes;
        unitPlanned.address = unit.address;

        return unitPlanned;
    }

    public id: number;
    public unitId: number;
    public isTemporary: boolean;
    public from: string;
    public to: string;
    public sigle: string;
    public label: string;
    public labelShort: string;
    public parentId: number;
    public type: string;
    public lang: string;
    public cfNumber: number;
    public cf: string;
    public isEpfl: boolean;
    public sigleLong: string;
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
    public isValid: boolean;
    public labels: Label[];
    public attributes: Attribute[];
    public applyAt: string;
    public attachmentFilename: string;
    public attachmentDescription: string;
    public address: Address;

    constructor(obj: Object) {
        this.id = obj['id'];
        this.unitId = obj['unitId'];
        this.isTemporary = obj['isTemporary'];
        this.from = obj['from'];
        this.to = obj['to'];
        this.sigle = obj['sigle'];
        this.label = obj['label'];
        this.labelShort = obj['labelShort'];
        this.parentId = obj['parentId'];
        this.type = obj['type'];
        this.lang = obj['lang'];
        this.cfNumber = obj['cfNumber'];
        this.cf = obj['cf'];
        this.isEpfl = obj['isEpfl'];
        this.sigleLong = obj['sigleLong'];
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
        this.isValid = obj['isValid'];
        this.labels = obj['labels'];
        this.attributes = obj['attributes'];
        this.applyAt = obj['applyAt'];
        this.attachmentFilename = obj['attachmentFilename'];
        this.attachmentDescription = obj['attachmentDescription'];
        this.address = obj['address'];
    }
}
