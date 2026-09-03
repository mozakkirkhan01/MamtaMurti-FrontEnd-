import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
  transform(value: any, format: string = 'dd-MM-yyyy'): string {
    if (!value) return '';

    const date = new Date(value);
    if (isNaN(date.getTime())) return value; // Return original if invalid

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    // Handle format matching if needed, or default to dd-MM-yyyy
    if (format === 'dd-MM-yyyy') {
      return `${day}-${month}-${year}`;
    }
    return date.toLocaleDateString();
  }
}