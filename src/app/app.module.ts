import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { removeNgStyles, createNewHosts, createInputTransfer } from '@angularclass/hmr';
import { Ng2BootstrapModule, ModalModule, AlertModule } from 'ngx-bootstrap';
import { AutoCompleteModule, CalendarModule } from 'primeng/primeng';

/*
 * Platform and Environment providers/directives/pipes
 */
import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';
// App is our top level component
import { App } from './app.component';
import { APP_RESOLVER_PROVIDERS } from './app.resolver';
import { AppState, InternalStateType } from './app.service';

import { AboutComponent } from './about';
import { TreeComponent } from './tree';
import { LogoutComponent } from './logout';
import { OAuth2Component } from './oauth2';
import { SearchComponent } from './search';
import { UpdateUnitComponent } from './unit';
import { DeleteUnitComponent } from './unit';
import { ListUnitPlannedComponent } from './unit';
import { ChangeDocComponent } from './changedoc';
import { TreeViewComponent } from './tree';
import { HierarchyComponent } from './unit';
import { HelpComponent } from './help';
import { NoContentComponent } from './no-content';
import { UnauthorizedComponent } from './common';

import {AuthGuard} from './auth/authguard';
import {AuthService} from './services/auth.service';
import { SharedAppStateService } from './services/sharedappstate.service';

import { AttributeFilterPipe } from './common/attributefilter.pipe';
import { ContainsPipe } from './common/contains.pipe';
import { CapitalizePipe } from './common/capitalize.pipe';

import { SigleInputDirective } from './directives/sigleInput.directive';
import { DateInputDirective } from './directives/dateInput.directive';
import { NumberInputDirective } from './directives/numberInput.directive';
import { UnitLabelInputDirective } from './directives/unitLabelInput.directive';

// Application wide providers
const APP_PROVIDERS = [
  ...APP_RESOLVER_PROVIDERS,
  AppState,
  AuthGuard,
  AuthService,
  SharedAppStateService
];

type StoreType = {
  state: InternalStateType,
  restoreInputValues: () => void,
  disposeOldHosts: () => void
};

/**
 * `AppModule` is the main entry point into Angular2's bootstraping process
 */
@NgModule({
  bootstrap: [ App ],
  declarations: [
    App,
    AboutComponent,
    TreeComponent,
    LogoutComponent,
    OAuth2Component,
    SearchComponent,
    UpdateUnitComponent,
    DeleteUnitComponent,
    ListUnitPlannedComponent,
    ChangeDocComponent,
    TreeViewComponent,
    HierarchyComponent,
    HelpComponent,
    NoContentComponent,
    UnauthorizedComponent,
    AttributeFilterPipe, CapitalizePipe, ContainsPipe,
    SigleInputDirective, NumberInputDirective, UnitLabelInputDirective, DateInputDirective
  ],
  imports: [ // import Angular's modules
    BrowserModule,
    Ng2BootstrapModule.forRoot(), ModalModule.forRoot(), AlertModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AutoCompleteModule, CalendarModule,
    RouterModule.forRoot(ROUTES, { useHash: true })
  ],
  providers: [ // expose our Services and Providers into Angular's dependency injection
    ENV_PROVIDERS,
    APP_PROVIDERS
  ]
})
export class AppModule {
  constructor(public appRef: ApplicationRef, public appState: AppState) {}

  hmrOnInit(store: StoreType) {
    if (!store || !store.state) return;
    console.log('HMR store', JSON.stringify(store, null, 2));
    // set state
    this.appState._state = store.state;
    // set input values
    if ('restoreInputValues' in store) {
      let restoreInputValues = store.restoreInputValues;
      setTimeout(restoreInputValues);
    }

    this.appRef.tick();
    delete store.state;
    delete store.restoreInputValues;
  }

  hmrOnDestroy(store: StoreType) {
    const cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // save state
    const state = this.appState._state;
    store.state = state;
    // recreate root elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // save input values
    store.restoreInputValues  = createInputTransfer();
    // remove styles
    removeNgStyles();
  }

  hmrAfterDestroy(store: StoreType) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }

}

