import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class DepartmentDropdownComponent {
  departments: string[] = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Radiology'];
  selectedDepartment: string = '';

  onDepartmentChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedDepartment = target.value;
    console.log('Selected Department:', this.selectedDepartment);
  }
}
