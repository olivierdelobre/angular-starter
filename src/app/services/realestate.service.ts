import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class RealEstateService {

    private static readonly SERVICE_PREFIX = process.env.ARCHIBUS_API_URL;
    // private static readonly SERVICE_PREFIX = 'http://idevelopsrv1.epfl.ch:6081/infrastructure/v1/';
    // private static readonly SERVICE_PREFIX = 'http://localhost:8084/archibus-api/v1/';
    // private static readonly SERVICE_PREFIX = 'http://idevelopsrv1.epfl.ch:8084/archibus-api/v1/';

    constructor(private http: Http) { }

    /******************************************************
    *   search for a room
    ******************************************************/
    public searchRoomsByLabel(query: string) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem(process.env.APP_NAME + '.RealEstate.token'));

        let url: string;
        url = RealEstateService.SERVICE_PREFIX + 'rooms?query=' + query;
        
        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => res.json());
    }

    /******************************************************
    *   get a room by id
    ******************************************************/
    public getRoomById(id: number) {
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Cache-Control', 'no-cache');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem(process.env.APP_NAME + '.RealEstate.token'));

        let url: string;
        url = RealEstateService.SERVICE_PREFIX + 'rooms/' + id;
        
        // console.log("calling " + url);

        return this.http.get(url, { headers: headers })
            .map((res) => res.json());
    }
}
