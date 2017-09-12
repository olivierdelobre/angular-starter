import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class CadiService {

    private static readonly SERVICE_PREFIX = process.env.CADI_API_URL;
    // private static readonly SERVICE_PREFIX = 'http://idevelopsrv1.epfl.ch:6081/idm/v1/';
    // private static readonly SERVICE_PREFIX = 'http://idevelopsrv1.epfl.ch:8082/cadi-api/v1/';
    // private static readonly SERVICE_PREFIX = 'http://localhost:8082/cadi-api/v1/';

    constructor(private http: Http) { }

    /******************************************************
    *   get calculated address
    ******************************************************/
    public getUnitAddress(sigle: string, separator: string) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        
        let url: string;
        url = CadiService.SERVICE_PREFIX + 'units/' + sigle + '/addresses?separator=' + separator;
        
        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => res.json());
    }
}
