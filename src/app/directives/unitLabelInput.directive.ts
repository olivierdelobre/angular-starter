import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[unit-label-input]'
})
export class UnitLabelInputDirective {

  @HostListener('keypress', ['$event']) public validateInput(event: any) {
    const pattern = /[a-zA-Z\s]/;
    let inputChar = String.fromCharCode(event.charCode).toUpperCase();

    if (!pattern.test(inputChar) && event.charCode != 0) {
      event.preventDefault();
    }
  }
}