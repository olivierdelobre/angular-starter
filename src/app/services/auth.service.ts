import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {
    private loggedIn = false;
    private isSuperAdmin: boolean;

    constructor(private http: Http) {
        this.loggedIn = !!localStorage.getItem('auth_token');
    }

    public isLoggedIn() {
        return !!localStorage.getItem('auth_token');
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
        localStorage.removeItem('auth_token');
        this.loggedIn = false;
    }

    public getUserinfo() {
        return this.http.get(process.env.OAUTH2_PROVIDER_URL
            + 'userinfo?access_token=Bearer%20'
            + localStorage.getItem('auth_token'))
            .map((res) => res.json());
    }
}
