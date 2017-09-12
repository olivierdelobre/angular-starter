import { ChangeLogAttachment } from './changelogattachment.model';

export class ChangeLog {
    public static fromJSONArray(array: Array<Object>): ChangeLog[] {
        return array.map((obj) => new ChangeLog(obj));
    }

    public id: number;
    public unitId: number;
    public operationType: string;
    public fieldType: string;
    public fieldName: string;
    public fromValue: string;
    public toValue: string;
    public createdAt: Date;
    public createdBy: string;
    public attachment: ChangeLogAttachment;

    constructor(obj: Object) {
        this.id = obj['id'];
        this.unitId = obj['unitId'];
        this.operationType = obj['operationType'];
        this.fieldType = obj['fieldType'];
        this.fieldName = obj['fieldName'];
        this.fromValue = obj['fromValue'];
        this.toValue = obj['toValue'];
        this.createdAt = obj['createdAt'];
        this.createdBy = obj['createdBy'];
        this.attachment = obj['changeLogAttachment'];
    }
}
