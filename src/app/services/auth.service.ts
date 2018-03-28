import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {
    private loggedIn = false;
    private isSuperAdmin: boolean;

    constructor(private http: Http) {
        this.loggedIn = !!localStorage.getItem(process.env.APP_NAME + '.Units.token');
    }

    public isLoggedIn() {
        return !!localStorage.getItem(process.env.APP_NAME + '.Units.token');
    }

    public hasSuperAdminRole(loggedUserInfo: any) {
        if (loggedUserInfo == null) {
            return false;
        }
        if (loggedUserInfo.scopes != null && loggedUserInfo.scopes.split(' ') != null && loggedUserInfo.scopes.split(' ').indexOf('write') > -1) {
            return true;
        }

        return false;
    }

    public hasLimitedWriteRole(loggedUserInfo: any) {
        if (loggedUserInfo == null) {
            return false;
        }
        if (loggedUserInfo.scopes != null && loggedUserInfo.scopes.split(' ') != null && loggedUserInfo.scopes.split(' ').indexOf('limited.write') > -1) {
            return true;
        }

        return false;
    }

    public hasReadRole(loggedUserInfo: any) {
        if (loggedUserInfo == null) {
            return false;
        }
        if (loggedUserInfo.scopes != null && loggedUserInfo.scopes.split(' ') != null && loggedUserInfo.scopes.split(' ').indexOf('read') > -1) {
            return true;
        }

        return false;
    }

    public logout() {
        localStorage.removeItem(process.env.APP_NAME + '.Units.token');
        localStorage.removeItem(process.env.APP_NAME + '.Persons.token');
        localStorage.removeItem(process.env.APP_NAME + '.RealEstate.token');
        this.loggedIn = false;
    }

    public getUserinfo() {
        return this.http.get(process.env.OAUTH2_PROVIDER_URL
            + 'userinfo?access_token=Bearer%20'
            + localStorage.getItem(process.env.APP_NAME + '.Units.token'))
            .map((res) => res.json());
    }

    public redirectToLogin() {
        window.location.href = process.env.OAUTH2_PROVIDER_URL + 'auth?client_id=' + process.env.OAUTH2_CLIENT_ID + '&response_type=code&scope=Units,Tequila.profile,Persons,RealEstate&redirect_uri=' + process.env.OAUTH2_TOKEN_PROXY_URL;
    }
}
