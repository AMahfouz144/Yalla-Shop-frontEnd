import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyEgp'
})
export class CurrencyEgpPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
