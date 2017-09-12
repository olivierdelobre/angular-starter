import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class PlaceService {

    private static readonly SERVICE_PREFIX = process.env.CADI_API_URL;
    // private static readonly SERVICE_PREFIX = 'http://idevelopsrv1.epfl.ch:6081/place/v1/';
    // private static readonly SERVICE_PREFIX = 'http://idevelopsrv1.epfl.ch:8082/cadi-api/v1/';

    constructor(private http: Http) { }

    /******************************************************
    *   search for a country
    ******************************************************/
    public searchCountry(query: string) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');

        let url: string;
        url = PlaceService.SERVICE_PREFIX + 'countries?query=' + query;
        
        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => res.json());
    }

    /******************************************************
    *   get country by id
    ******************************************************/
    public getCountryById(countryId: number) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');

        let url: string;
        let prefix: string = '';
        url = PlaceService.SERVICE_PREFIX + 'countries/' + countryId;
        
        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => res.json());
    }

    /******************************************************
    *   search for a location
    ******************************************************/
    public searchLocation(query: string) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');

        let url: string;
        let prefix: string = '';
        url = PlaceService.SERVICE_PREFIX + 'locations?query=' + query;
        
        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => res.json());
    }

    /******************************************************
    *   search for a location
    ******************************************************/
    public getLocationsByPttOrder(pttOrder: number) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');

        let url: string;
        let prefix: string = '';
        url = PlaceService.SERVICE_PREFIX + 'locations?pttorder=' + pttOrder;
        
        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => res.json());
    }
}
