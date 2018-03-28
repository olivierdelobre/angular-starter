import { Routes, RouterModule } from '@angular/router';
import { AboutComponent } from './about';
import { TreeComponent } from './tree';
import { LogoutComponent } from './logout';
import { OAuth2Component } from './oauth2';
import { SearchComponent } from './search';
import { DisplayUnitComponent } from './unit';
import { HelpComponent } from './help';
import { NoContentComponent } from './no-content';
import { ListExportComponent } from './listexport';

import { AuthGuard } from './auth/authguard';

import { DataResolver } from './app.resolver';


export const ROUTES: Routes = [
  { path: '', redirectTo: '/unites', pathMatch: 'full' },
  { path: 'logout',  component: LogoutComponent },
  { path: 'oauth2/:token', component: OAuth2Component },
  { path: 'about', component: AboutComponent, canActivate: [AuthGuard] },
  { path: 'liste',  component: ListExportComponent },
  { path: 'unites',  component: TreeComponent },
  { path: 'unites/:unitId', component: DisplayUnitComponent },
  { path: 'recherche',  component: SearchComponent },
  { path: 'aide',  component: HelpComponent },
  { path: '**',    component: NoContentComponent },
];
