import { Pipe, PipeTransform } from '@angular/core';
import { Attribute } from '../model/attribute.model';

@Pipe({ name: 'attributefilter' })
export class AttributeFilterPipe implements PipeTransform  {
    transform(items: any[], args: string): any {
        if (!items) {
            return;
        } 
        // console.log("size of items = " + items.length + ", filter = " + args);
        return items.filter((item) => item.code == args);
    }
}
