import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[date-input]'
})
export class DateInputDirective {
  @HostListener('keypress', ['$event']) public validateInput(event: any) {
    const pattern = /[\d\.]/;
    let inputChar = String.fromCharCode(event.charCode).toUpperCase();

    if (!pattern.test(inputChar) && event.charCode != 0) {
      event.preventDefault();
    }
  }
}