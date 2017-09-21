import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class SciperService {

    private static readonly SERVICE_PREFIX = process.env.SCIPER_API_URL;
    // private static readonly SERVICE_PREFIX = 'http://idevelopsrv1.epfl.ch:6081/idm/v1/';
    // private static readonly SERVICE_PREFIX = 'http://idevelopsrv1.epfl.ch:8083/sciper-api/v1/';
    // private static readonly SERVICE_PREFIX = 'http://localhost:8083/sciper-api/v1/';

    constructor(private http: Http) { }

    /******************************************************
    *   Search person by his name
    ******************************************************/
    public searchByName(query: string) {
        let headers = new Headers();
        headers.append('Authorization', 'Basic ' + btoa('delobre:secret'));
        headers.append('Accept', 'application/json');

        let url: string;
        url = SciperService.SERVICE_PREFIX + 'people?query=' + query + "&hasAccreds";
        
        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => res.json());
    }

    /******************************************************
    *   Get person by Id
    ******************************************************/
    public getById(id: number) {
        let headers = new Headers();
        headers.append('Authorization', 'Basic ' + btoa('delobre:secret'));
        headers.append('Accept', 'application/json');

        let url: string;
        url = SciperService.SERVICE_PREFIX + 'people/' + id;
        
        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => res.json());
    }
}
