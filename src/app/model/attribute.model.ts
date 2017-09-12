export class Attribute {
    public static fromJSONArray(array: Array<Object>): Attribute[] {
        return array.map((obj) => new Attribute(obj));
    }

    public id: number;
    public unit_id: number;
    public code: string;
    public lang: string;
    public mimeType: string;
    public size: string;
    public text: string;
    public url: string;
    public from: string;
    public to: string;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date;
    public updatedBy: string;

    constructor(obj: Object) {
        this.id = obj['id'];
        this.unit_id = obj['unitId'];
        this.code = obj['code'];
        this.lang = obj['lang'];
        this.mimeType = obj['mimeType'];
        this.size = obj['size'];
        this.text = obj['text'];
        this.url = obj['url'];
        this.from = obj['from'];
        this.to = obj['to'];
        this.createdAt = obj['createdAt'];
        this.createdBy = obj['createdBy'];
        this.updatedAt = obj['updatedAt'];
        this.updatedBy = obj['updatedBy'];
    }
}
