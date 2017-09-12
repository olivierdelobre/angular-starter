import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[sigle-input]'
})
export class SigleInputDirective {
  //@Output() ngModelChange: EventEmitter<any> = new EventEmitter()
  
  @HostListener('keypress', ['$event']) public validateInput(event: any) {
    const pattern = /[a-zA-Z\-\d]/;
    let inputChar = String.fromCharCode(event.charCode).toUpperCase();

    if (!pattern.test(inputChar) && event.charCode != 0) {
      event.preventDefault();
    }
  }
}