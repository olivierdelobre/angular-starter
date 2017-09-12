import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[number-input]'
})
export class NumberInputDirective {
  @HostListener('keypress', ['$event'])
  
  public validateInput(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar) && event.charCode != 0) {
      event.preventDefault();
    }
  }

}