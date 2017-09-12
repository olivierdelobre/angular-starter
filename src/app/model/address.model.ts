export class Address {
    public static fromJSONArray(array: Array<Object>): Address[] {
        return array.map((obj) => new Address(obj));
    }

    public id: number;
    public countryId: number;
    public address1: string;
    public address2: string;
    public address3: string;
    public address4: string;
    public address5: string;
    public pttOrder: number;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date;
    public updatedBy: string;

    constructor(obj: Object) {
        this.id = obj['id'];
        this.countryId = obj['countryId'];
        this.address1 = obj['address1'];
        this.address2 = obj['address2'];
        this.address3 = obj['address3'];
        this.address4 = obj['address4'];
        this.address5 = obj['address5'];
        this.pttOrder = obj['pttOrder'];
        this.createdAt = obj['createdAt'];
        this.createdBy = obj['createdBy'];
        this.updatedAt = obj['updatedAt'];
        this.updatedBy = obj['updatedBy'];
    }
}
