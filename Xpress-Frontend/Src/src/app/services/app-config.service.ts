import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConfig } from '../models/app-config';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private appConfig!: AppConfig;
  private httpClient!: HttpClient;
  private readonly configPath = 'assets/environment-config.json';

  constructor(private readonly httpBackEnd: HttpBackend) {
    this.httpClient = new HttpClient(httpBackEnd);
  }

  loadConfiguration() {
    return this.httpClient
      .get(this.configPath)
      .toPromise()
      .then((res) => {
        this.appConfig = res as AppConfig;
      });
  }

  getConfig() {
    return this.appConfig;
  }
}
