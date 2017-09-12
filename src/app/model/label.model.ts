export class Label {
    public static fromJSONArray(array: Array<Object>): Label[] {
        return array.map((obj) => new Label(obj));
    }

    public unitId: number;
    public lang: string;
    public sigle: string;
    public label: string;
    public labelShort: string;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date;
    public updatedBy: string;

    constructor(obj: Object) {
        this.unitId = obj['unitId'];
        this.lang = obj['lang'];
        this.sigle = obj['sigle'];
        this.label = obj['label'];
        this.labelShort = obj['labelShort'];
        this.createdAt = obj['createdAt'];
        this.createdBy = obj['createdBy'];
        this.updatedAt = obj['updatedAt'];
        this.updatedBy = obj['updatedBy'];
    }
}
