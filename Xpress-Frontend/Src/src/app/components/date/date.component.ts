import { Component } from '@angular/core';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  standalone: true,
})
export class DateComponent {
  today: Date = new Date(); // Get today's date

  getFormattedDate(): string {
    return this.today.toLocaleDateString(); // Format the date
  }
}
