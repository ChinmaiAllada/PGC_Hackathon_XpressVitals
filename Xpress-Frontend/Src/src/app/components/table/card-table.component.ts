import { Component, OnInit } from '@angular/core';
import { Patient, PatientService } from '../../services/patient.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop'; // Import CDK Drag and Drop
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-table',
  templateUrl: './card-table.component.html',
  styleUrls: ['./card-table.component.scss'],
  standalone: true,
  imports:[CommonModule, DragDropModule]
})
export class CardTableComponent implements OnInit {
  people: Patient[] = []; // Array to hold patient data
  parameters: any[] = [];
  loading: boolean = true; // Flag for loading state
  error: string | null = null; // Variable to hold error message
  isEditMode: boolean = false; // Flag for Edit mode
  responseMessage: string = '';
  constructor(
    private patientService: PatientService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.fetchPatients(); // Fetch patients on initialization
  }

  fetchPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (data: Patient[]) => {
        
        this.people = data; // Update the people array with the fetched data
        this.loading = false; // Set loading to false
      },
      error: (err: any) => {
        this.error = 'Failed to load patient data'; // Handle error
        this.loading = false; // Set loading to false
      }
    });

    this.patientService.getParameters().subscribe({
      next: (data: any[]) => {
        console.log(data, 'gggggg');

        this.parameters = data; // Update the people array with the fetched data
        this.loading = false; // Set loading to false
      },
      error: (err: any) => {
        this.error = 'Failed to load parameters data'; // Handle error
        this.loading = false; // Set loading to false
      }
    });

  }


  getIndicatorColor(): string {
    return 'red';
  }

  // Drag and drop function to handle row reordering
  drop(event: CdkDragDrop<Patient[]>): void {
    moveItemInArray(this.people, event.previousIndex, event.currentIndex); // Reorder items in the array
  }

  // Toggle between Edit and Save mode
  toggleEditMode(): void {
    this.isEditMode = true; // Enter edit mode (enable row reordering)
  }

  saveOrder(): void {
    this.isEditMode = false; // Exit edit mode (disable row reordering)
    console.log('New order saved:', this.people); // Log the new order or send it to the server
    // Here you can add logic to save the new order of patients to your backend.
  }

  // sendSms(): void {

  //   this.people.forEach(person => {
  //     const message = `Hello ${person.Name}, this is a test message.`;
  //     this.sendMessage(person.Contact, message);
  //   });
  // }

  sendSms(): void {
    this.parameters.forEach(person => {


      // Simulate the classifications data for each patient as an example
      const patientData: any = {
        Name: person.Name,
        Contact: person.Contact,
        BUN: person.Classifications.BUN,
        Hemoglobin: person.Classifications['Hemoglobin (Male)'] || person.Classifications['Hemoglobin (Female)'],
        Bilirubin: person.Classifications.Bilirubin,
        Creatinine: person.Classifications.Creatinine,
        HbA1c: person.Classifications.HbA1c,
        Platelets: person.Classifications.Platelets,
        Potassium: person.Classifications.Potassium,
        Sodium: person.Classifications.Sodium,
        TSH: person.Classifications.TSH
      };



      let abnormalParams: string[] = [];
      let criticalParams: string[] = [];
      let normalParams: string[] = [];


      Object.keys(patientData).forEach(param => {
        if (param !== 'Name' && param !== 'Contact') {
          if (patientData[param] === "Abnormal") {
            abnormalParams.push(`*${param}*`);
          } else if (patientData[param] === "Critical Low" || patientData[param] === "Critical High") {
            criticalParams.push(`*${param}*`);
          } else if(patientData[param] === "Normal"){
            normalParams.push(`*${param}*`);
          }
        }
      });

      const criticalEmoji = '🚨';  // Critical emoji
      const abnormalEmoji = '⚠️';   // Abnormal emoji
      const normalEmoji = '✅';      
     console.log(normalParams.length,'normal');
     
      const message = `
    Hello ${person.Name}, here are your latest test results:
    ${criticalParams.length > 0 ? `${criticalEmoji} CRITICAL: ${criticalParams.join(', ')}` : ''}
    ${abnormalParams.length > 0 ? `${abnormalEmoji} ABNORMAL: ${abnormalParams.join(', ')}` : ''}
    ${normalParams.length === 9 ? `${normalEmoji} Congratulations, All your parameters are NORMAL` : ''}
    Please reply to this message with the symptoms you are feeling.
`.trim();


      this.patientService.sendOpenAIWithParams(criticalParams, abnormalParams, person.Contact, person.Name)
        .subscribe((response: any) => {
          console.log("OpenAI response saved:", response.message);
        });
      this.sendMessage(person.Contact, message);
    });
  }


  printTable(): void {
    // Implement the logic for printing the table
    window.print(); // A simple way to print the current window
  }

  sendMessage(to: string, message: string) {
    this.http.post('https://932a-125-18-231-142.ngrok-free.app/send', { to, body: message })
      .pipe(
        catchError(error => {
          this.responseMessage = `Network error: ${error.message}`;
          return throwError(error);
        })
      )
      .subscribe((data: any) => {
        if (data.message_sid) {
          this.responseMessage = `Message sent! SID: ${data.message_sid}`;
        } else {
          this.responseMessage = `Error: ${data.error}`;
        }
      });
  }

}
