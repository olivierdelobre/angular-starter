import { Routes, RouterModule } from '@angular/router';
import { Home } from './home';
import { AboutComponent } from './about';
import { TreeComponent } from './tree';
import { LogoutComponent } from './logout';
import { OAuth2Component } from './oauth2';
import { SearchComponent } from './search';
import { HelpComponent } from './help';
import { NoContentComponent } from './no-content';

import { AuthGuard } from './auth/authguard';

import { DataResolver } from './app.resolver';


export const ROUTES: Routes = [
  { path: '', redirectTo: '/arbre', pathMatch: 'full' },
  { path: 'logout',  component: LogoutComponent },
  { path: 'oauth2/:token', component: OAuth2Component },
  { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
  { path: 'arbre',  component: TreeComponent },
  { path: 'arbre/:openedIds',  component: TreeComponent },
  { path: 'recherche',  component: SearchComponent },
  { path: 'aide',  component: HelpComponent },
  { path: '**',    component: NoContentComponent },
];
