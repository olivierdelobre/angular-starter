import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'contains' })
export class ContainsPipe implements PipeTransform  {
    transform(value: string, args: string): any {
        if (!value) {
            return false;
        } 
        if (value.indexOf(args) > -1) {
            return true;
        }
        return false;
    }
}
