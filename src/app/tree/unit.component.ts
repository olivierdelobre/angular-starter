import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Unit } from '../model/unit.model';

@Component({
    selector: 'app-unit',
    styles: [`
        .unit-opener, .unit-name {
            display: inline-block;
        }
    `],
    template: `
        <div class="unit-opener" (click)="selectUnit()">></div> <div class="unit-name">{{unit.sigle}}</div>
    `
})
export class UnitComponent {
    @Input() unit: Unit;
    @Output() unitSelected: EventEmitter<Unit> = new EventEmitter<Unit>();

    selectUnit() {
        this.unitSelected.emit(this.unit);
    }

    ngOnInit() {

    }
}
