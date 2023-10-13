import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { AuthService } from '@auth0/auth0-angular';
import config from '../../../../auth_config.json'

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  @Input() rawUsers: {username: string; email: string; verified: boolean, user_id:string}[] = [];
  @ViewChildren('checkboxes') checkboxes:MatCheckbox[];
  constructor(private formBuilder: FormBuilder, public auth: AuthService, private http: HttpClient) {
   }
  
  ngOnInit(): void { }

  async sendEmail() {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", "Bearer " + config.api_token);

    let usersToEmail = [];
    let body = [];
    const promises = [];

    for (const user of this.rawUsers) {
      if (user.verified === false) {
        let checkboxVal = this.checkboxes.find((checkbox) => checkbox.id === user.user_id).checked;

        if (checkboxVal === true) {
          const requestBody = {
            user_id: user.user_id,
            client_id: config.clientId,
            audience: config.authorizationParams.audience,
            identity: {
              user_id: user.user_id.replace('auth0|', ''),
              provider: 'auth0',
            },
            email: user.email,
          };

          const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(requestBody),
          };

          console.log(requestOptions.body);

          const promise = fetch('http://localhost:3001/password-change', requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.error('error', error));

          promises.push(promise);
        }
      }
    }

    // Wait for all promises to resolve sequentially
    for (const promise of promises) {
      await promise;
    }
  }
}
