import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    public canActivate() {
        if (this.authService.isLoggedIn()) {
            return true;
        }
        // Redirect the user before denying them access to this route
        this.router.navigate(['/login']);
        return false;
    }
}
