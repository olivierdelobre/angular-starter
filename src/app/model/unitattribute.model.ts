export class UnitAttribute {
    public static fromJSONArray(array: Array<Object>): UnitAttribute[] {
        return array.map((obj) => new UnitAttribute(obj));
    }

    public code: string;
    public label: string;

    constructor(obj: Object) {
        this.code = obj['code'];
        this.label = obj['label'];
    }
}
