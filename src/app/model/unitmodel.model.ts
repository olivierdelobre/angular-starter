import { Label } from './label.model';
import { Unit } from './unit.model';
import { Attribute } from './attribute.model';
import { Address } from './address.model';

export class UnitModel {
    public static fromJSONArray(array: Array<Object>): UnitModel[] {
        return array.map((obj) => new UnitModel(obj));
    }

    public static fromUnit(unit: Unit) {
        let unitModel = new UnitModel({});
        unitModel.cf = unit.cf;
        unitModel.cfNumber = unit.cfNumber;
        unitModel.id = unit.id;
        unitModel.isEpfl = unit.isEpfl;
        unitModel.isTemporary = unit.isTemporary;
        unitModel.isValid = unit.isValid;
        unitModel.from = unit.from;
        unitModel.to = unit.to;
        unitModel.label = unit.label;
        unitModel.labelShort = unit.labelShort;
        unitModel.lang = unit.lang;
        unitModel.level = unit.level;
        unitModel.sigleLong = unit.sigleLong;
        unitModel.parentId = unit.parentId;
        unitModel.position = unit.position;
        unitModel.responsibleId = unit.responsibleId;
        unitModel.roomId = unit.roomId;
        unitModel.sigle = unit.sigle;
        unitModel.station = unit.station;
        unitModel.type = unit.type;
        unitModel.zipcode = unit.zipcode;
        unitModel.labels = unit.labels;
        unitModel.attributes = unit.attributes;
        unitModel.address = unit.address;

        return unitModel;
    }

    public id: number;
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
    public address: Address;

    constructor(obj: Object) {
        this.id = obj['id'];
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
        this.address = obj['address'];
    }
}
