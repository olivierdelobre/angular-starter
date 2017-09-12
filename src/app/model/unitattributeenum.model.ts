export class UnitAttributeEnum {
    public static fromJSONArray(array: Array<Object>): UnitAttributeEnum[] {
        return array.map((obj) => new UnitAttributeEnum(obj));
    }

    public code: string;
    public value: string;
    public comment: string;

    constructor(obj: Object) {
        this.code = obj['code'];
        this.value = obj['value'];
        this.comment = obj['comment'];
    }
}
