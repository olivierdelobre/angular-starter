import { Component, ViewChild, ViewEncapsulation, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ModalDirective, TabDirective } from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';

import { TreeService } from '../services/units.service';
import { Unit } from '../model/unit.model';


@Component({
  selector: 'app-deleteunit',
  providers: [ TreeService ],
  styleUrls: [ './deleteunit.style.css', '../app.style.css' ],
  templateUrl: './deleteunit.template.html',
  encapsulation: ViewEncapsulation.None /* required to be able to override primeNG styles */
})
export class DeleteUnitComponent implements OnInit, OnDestroy {
  unitToDelete: Unit;
  alerts: Array<Object> = [];
  showView: boolean = false;

  @ViewChild('deleteConfirmationModal') deleteConfirmationModal: ModalDirective;

  @Output() unitDeleted: EventEmitter<Unit> = new EventEmitter<Unit>();
  @Output() messageTriggered: EventEmitter<any> = new EventEmitter<any>();
  
  constructor(private treeService: TreeService) {  }


  /******************************************************
  *   entry point for other components
  ******************************************************/
  triggerDeleteUnit(unit: Unit) {
    this.showView = true;
    this.unitToDelete = unit;
    this.deleteConfirmationModal.show();
  }
  

  /******************************************************
  *   delete unit
  ******************************************************/
  deleteUnit() {
    // console.log('delete unit ' + this.unitToDelete.id + ' ' + this.unitToDelete.sigle);

    this.treeService.deleteUnit(this.unitToDelete)
      .subscribe(
        (res) => {
          this.deleteConfirmationModal.hide();
          this.alerts.push({msg: 'Unité supprimée avec succès !', type: 'success', closable: true});
        },
        (error) => {
          this.deleteConfirmationModal.hide();
          let errorBody = JSON.parse(error._body);
          // console.log("Error message = " + errorBody.reasons[0].message);
          this.showView = false;
          this.messageTriggered.emit({ message: errorBody.reasons[0].message, level: 'danger' });
        },
        () => {
          this.showView = false;
          this.unitDeleted.emit(this.unitToDelete);
          this.messageTriggered.emit({ message: 'Unité supprimée avec succès', level: 'success' });
        }
      );
  }


  /******************************************************
  *   closeModal
  ******************************************************/
  closeModal() {
    this.showView = false;
    this.deleteConfirmationModal.hide();
  }
  onHide() {
    this.showView = false;
  }

  /******************************************************
  *   on destroy
  ******************************************************/
  ngOnDestroy() {
    // console.log('ngOnDestroy `Tree` component');
  }

  /******************************************************
  *   on init
  ******************************************************/
  ngOnInit() {
    this.unitToDelete = new Unit({});
  }
}
