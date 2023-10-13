import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import config from '../../auth_config.json';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  ping$(): Observable<any> {
    return this.http.get(`${config.apiUri}/api/external`);
  }

  getUsers(): Observable<any> {
    const headers = this.createHeaders();
    return this.http.get(`${config.apiUri}/api/users`, { headers });
  }

  createHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + config.api_token, // Replace with your Auth0 API Access Token
    });
    return headers;
  }
}
