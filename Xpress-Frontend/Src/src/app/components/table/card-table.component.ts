import { Component, OnInit } from '@angular/core';
import { Patient, PatientService } from '../../services/patient.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop'; // Import CDK Drag and Drop
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-table',
  templateUrl: './card-table.component.html',
  styleUrls: ['./card-table.component.scss'],
  standalone: true,
  imports: [CommonModule, DragDropModule]
})
export class CardTableComponent implements OnInit {
  people: Patient[] = []; // Array to hold patient data
  parameters: any[] = [];
  loading: boolean = true; // Flag for loading state
  error: string | null = null; // Variable to hold error message
  isEditMode: boolean = false; // Flag for Edit mode
  responseMessage: string = '';
  dynamicColumns: any = []; // array for dynamic columns
  buttonClicked = false; // track if the button has been clicked
  patient_level: any[] = [];
  pollingInterval: any;
  patientClassifications: any;

  constructor(
    private patientService: PatientService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.parameters.forEach(person => {
      person.symptoms = '';
      person.duration = '';
    });
    this.fetchPatients(); // Fetch patients on initialization
    
    this.patientClassifications= new Map<number, string> ();
    
  }

  clearData(): void {
    // this.people = []; // Clear previous patients
    // this.loading = true; // Reset loading state
    // this.error = null; // Clear any previous error messages
    // this.patientClassifications.clear(); // Clear the patient classifications map
    this.parameters = []; // Clear previous parameters
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
        data.forEach(patient => {
          this.patientClassifications.set(patient.ID, patient.FinalClassification);
        });
        this.parameters = data; // Update the people array with the fetched data
        this.loading = false; // Set loading to false
      },
      error: (err: any) => {
        this.error = 'Failed to load parameters data'; // Handle error
        this.loading = false; // Set loading to false
      }
    });

  }


  getIndicatorColor(duration: any): string {
    switch (duration) {
      case '24 hours':
        return '#A00000'; // Dark Red
      case '1 week':
        return '#FF9999'; // Light Red
      case '2 weeks':
        return '#FFFF00'; // Yellow
      case '1 month':
        return '#4CAF50'; // Green
      default:
        return '#B0B0B0'; // Gray
    }
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

  startPollingSymptoms() {
    const intervalId = setInterval(() => {
      let allUpdated = true; // Flag to check if all symptoms and durations are updated
  
      this.people.forEach(person => {
        console.log(person.symptoms, person.duration);
        
        if (person.symptoms !== 'N/A' && person.duration !== 'N/A' && person.symptoms!== undefined && person.duration !== undefined) {
          // If both symptoms and duration are already updated, skip polling for this person
          return; 
        }
  
        allUpdated = false; // At least one person is still being updated
  
        this.patientService.getSymptoms(person.Contact).subscribe(response => {
          // Update person's symptoms
          person.symptoms = response.symptoms || 'N/A';
          person.duration = response.duration || 'N/A';
  
          // Stop polling if both symptoms and duration are updated
          if (person.symptoms !== 'N/A' && person.duration !== 'N/A'  && person.symptoms!== undefined && person.duration !== undefined) {
            // Check if all persons are updated
            if (this.people.every(p => p.symptoms !== 'N/A' && p.duration !== 'N/A')) {
              clearInterval(intervalId); // Clear the polling interval
            }
          }
        });
      });
  
      // If all people are updated, clear the interval
      if (allUpdated) {
        clearInterval(intervalId);
      }
  
    }, 5000); // Poll every 5 seconds
  }
  


  // startPollingSymptoms() {
  //   setInterval(() => {
  //     this.people.forEach(person => {
  //       this.patientService.getSymptoms(person.Contact).subscribe(response => {
  //         // Update person's symptoms
  //         person.symptoms = response.symptoms || 'N/A';
  //         person.duration = response.duration || 'N/A';
  //       });
  //     });
  //   }, 5000);  // Poll every 5 seconds
    
  // }

  sendSms(): void {
    this.startPollingSymptoms();
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
          } else if (patientData[param] === "Normal") {
            normalParams.push(`*${param}*`);
          }
        }
      });

      const criticalEmoji = '🚨';  // Critical emoji
      const abnormalEmoji = '⚠️';   // Abnormal emoji
      const normalEmoji = '✅';
      console.log(normalParams.length, 'normal');

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
    this.http.post('https://9da6-203-200-15-250.ngrok-free.app/send', { to, body: message })
      .pipe(
        catchError(error => {
          this.responseMessage = `Network error: ${error.message}`;
          return throwError(error);
        })
      )
      .subscribe((data: any) => {
        if (data.message_sid) {
          this.responseMessage = `Message sent! SID: ${data.message_sid}`;
          console.log(this.responseMessage);

        } else {
          this.responseMessage = `Error: ${data.error}`;
        }
      });
  }

  // addDynamicColumns() {
  //   this.patientService.sendPatientLevel(this.parameters)
  //   .subscribe((data: any) => {
  //     if (data) {
  //       this.patient_level = data;
  //       // Create new column data based on patient classifications
  //       const newColumnData = this.patient_level.map((classification: any) => ({
  //         header: 'Level from Reports', 
  //         value: classification.Classification, // Use the classification value
  //         patientID: classification.PatientID // Store patientID for matching
  //       }));

  //       // Push new column data into dynamicColumns
  //       this.dynamicColumns.push(...newColumnData);

  //       // Now set buttonClicked to true to disable the button
  //       this.buttonClicked = true; // Disable button after click
  //     }

  //   });

  // addDynamicColumns() {
  //   this.patientService.sendPatientLevel(this.parameters)
  //     .subscribe((data: any) => {
  //       if (data) {
  //         this.patient_level = data;

  //         // Create a map for quick lookup of classifications by PatientID
  //         const classificationMap = data.reduce((map: any, classification: any) => {
  //           map[classification.PatientID] = classification.Classification;
  //           return map;
  //         }, {});

  //         // Now add the classification to each person based on PatientID
  //         this.people.forEach(person => {
  //           const classification = classificationMap[person.ID];
  //           person.Classification = classification || 'Unknown'; // Default to 'Unknown' if no classification found

  //         });
  //         console.log(this.people);

  //         this.dynamicColumns.push({ header: 'Level from Reports',value: this.people[patientID].Classification });



  //         // Update dynamic columns to reflect the new classification


  //         // Disable the button after adding columns
  //         this.buttonClicked = true;
  //       }
  //     });
  // }



  // addDynamicColumns() {
  //   this.patientService.sendPatientLevel(this.parameters)
  //     .subscribe((data: any) => {
  //       if (data) {
  //         this.patient_level = data;

  //         // Create a mapping from PatientID to Classification
  //         const classificationMap = new Map<number, string>();
  //         this.patient_level.forEach((classification: any) => {
  //           classificationMap.set(classification.PatientID, classification.Classification);
  //         });

  //         // Push new column data into dynamicColumns
  //         // this.dynamicColumns.push({
  //           this.patientClassifications = classificationMap
  //         // });

  //         // Now set buttonClicked to true to disable the button
  //         this.buttonClicked = true; // Disable button after click
  //       }
  //     });
  // }




}
