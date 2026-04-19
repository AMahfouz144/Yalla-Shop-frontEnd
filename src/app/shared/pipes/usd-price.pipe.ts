import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'usdPrice' })
export class UsdPricePipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(Number(value))) {
      return '$0';
    }
    const n = Number(value);
    const rounded = Math.round(n * 100) / 100;
    const hasFraction = Math.abs(rounded % 1) > 0.001;
    const text = hasFraction ? rounded.toFixed(2) : String(Math.round(rounded));
    return `$${text}`;
  }
}
