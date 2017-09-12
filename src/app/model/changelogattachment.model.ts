export class ChangeLogAttachment {
    public static fromJSONArray(array: Array<Object>): ChangeLogAttachment[] {
        return array.map((obj) => new ChangeLogAttachment(obj));
    }

    public id: number;
    public mimeType: string;
    public filename: string;
    public description: string;

    constructor(obj: Object) {
        this.id = obj['id'];
        this.mimeType = obj['mimeType'];
        this.filename = obj['filename'];
        this.description = obj['description'];
    }
}
