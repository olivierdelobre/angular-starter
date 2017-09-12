import { Component, ViewChild, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ModalDirective, TabDirective } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import * as moment from 'moment';

import { TreeService } from '../services/units.service';
import { AuthService } from '../services/auth.service';
import { SciperService } from '../services/sciper.service';
import { CadiService } from '../services/cadi.service';
import { Unit } from '../model/unit.model';
import { UnitModel } from '../model/unitmodel.model';
import { Label } from '../model/label.model';
import { Attribute } from '../model/attribute.model';

@Component({
  selector: 'app-hierarchy',
  providers: [ TreeService, AuthService, SciperService, CadiService ],
  styleUrls: [ './hierarchy.style.css', '../app.style.css' ],
  templateUrl: './hierarchy.template.html',
  encapsulation: ViewEncapsulation.None /* required to be able to override primeNG styles */
})
export class HierarchyComponent {
  @Input() unit: Unit;
  @Input() isRoot: boolean;
  
  constructor(public router: Router
  ) {  }
}
