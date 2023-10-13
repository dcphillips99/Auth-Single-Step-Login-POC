import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, User } from '@auth0/auth0-angular';
import Config from '../../../../auth_config.json'
import { async } from 'rxjs';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent {

  email: string = '';

  constructor(auth : AuthService, router : Router, route: ActivatedRoute, private http: HttpClient) { 
    route.queryParams.subscribe(params => {
      // Access and parse query parameters here
      const param1 = params['email'];
  
      // Do something with the parameters
      this.email = param1;
    });
    const body = {
      "email_verified": true,
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + Config.api_token,
      body: JSON.stringify(body)
    });
    
    // (async () => {
    //   await auth.loginWithPopup();
    // })();
    var options = {
      method: 'GET',
      url: 'https://{yourDomain}/api/v2/users-by-email',
      params: {email: '{userEmailAddress}'},
      headers: {authorization: 'Bearer ' + Config.api_token}
    };

    const getUserHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + Config.api_token
    });
    let user;

    http.get<any[]>(`https://dc-auth-test-poc.us.auth0.com/api/v2/users-by-email?email=${this.email.replace(/[0-9+]/g, '')}`, {headers: getUserHeaders}).toPromise()
    .then((response) => {
      user = response[0];

      let userId = user.user_id;
      if (!user?.email_verified) {
        console.log("Email not verified");
        let myHeaders = new Headers();
        let verifyBody = JSON.stringify({
          user_id: userId,
        });
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Authorization", "Bearer " + Config.api_token);
        let requestOptions = {
          method: 'PATCH',
          headers: myHeaders,
          body: verifyBody
          };
      
          fetch("http://localhost:3001/verify-user", requestOptions)
            .then(response => response.text())
            .then(result => console.log(result))
            .catch(error => console.log('error', error));
      } else {
        console.log("Email already verified");  
      }

      auth.loginWithRedirect({});
    });
    
  }
}
