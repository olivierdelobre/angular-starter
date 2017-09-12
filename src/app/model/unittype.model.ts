export class UnitType {
    public static fromJSONArray(array: Array<Object>): UnitType[] {
        return array.map((obj) => new UnitType(obj));
    }

    public code: string;
    public label: string;

    constructor(obj: Object) {
        this.code = obj['code'];
        this.label = obj['label'];
    }
}
