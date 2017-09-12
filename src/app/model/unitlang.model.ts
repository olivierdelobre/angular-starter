export class UnitLang {
    public static fromJSONArray(array: Array<Object>): UnitLang[] {
        return array.map((obj) => new UnitLang(obj));
    }

    public code: string;
    public label: string;

    constructor(obj: Object) {
        this.code = obj['code'];
        this.label = obj['label'];
    }
}
