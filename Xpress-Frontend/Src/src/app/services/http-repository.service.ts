import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class HttpRepositoryService {
  apiUrl: string;
  headers!: HttpHeaders;

  constructor(
    private httpClient: HttpClient,
    private config: AppConfigService
  ) {
    this.apiUrl = `${this.config.getConfig().apiUrls.apiBaseUrl}/${this.config.getConfig().apiUrls.apiVersion.v1}`;
  }
  public getPhoto() {
    const headers = {
      skip: 'true',
      'content-Type': 'image/jpg',
    };
    return this.httpClient.get(this.config.getConfig().graphApi.profileUrl, {
      headers: headers,
      responseType: 'blob',
    });
  }
}
