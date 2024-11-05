import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Patient {
  duration: any;
  symptoms: string;
  Classification: any;
  ID: number;
  Name: string;
  Contact: string ;
  Age: number;
  Gender: string;
  BUN: number;
  Bilirubin: number;
  Creatinine: number;
  HbA1c: number;
  Hemoglobin: number;
  Platelets: number;
  Potassium: number;
  Sodium: number;
  TSH: number;
}


@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://127.0.0.1:5000/patients';
  private parameterUrl = 'http://127.0.0.1:5000/classify';
  private openAIUrl = 'http://127.0.0.1:5000/openAIWithParams';
  
  constructor(private http: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    console.log('hii');
    return this.http.get<Patient[]>(this.apiUrl);
  }
  getParameters():  Observable<Patient[]> {
    return this.http.get<Patient[]>(this.parameterUrl);
  }
  sendOpenAIWithParams(criticalParams: string[], abnormalParams: string[], contact: String, name: String): Observable<any> {
    return this.http.post<any>(this.openAIUrl, {
      criticalParams: criticalParams,
      abnormalParams: abnormalParams,
      contact: contact,
      name: name
    });
  }
  

  getSymptoms(contact: string): Observable<any> {
    return this.http.get<any>(`http://127.0.0.1:5000/api/symptoms?contact=${contact}`);
  }
}
