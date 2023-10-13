import { Component } from '@angular/core';
import Config from '../../../../../auth_config.json'
import { ApiService } from '../../../api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-invite-users',
  templateUrl: './invite-users.component.html',
  styleUrls: ['./invite-users.component.css']
})
export class InviteUsersComponent {
  users: {username: string; email: string; verified: boolean, user_id:string}[] = [];

  constructor(api: ApiService, public auth: AuthService, private http: HttpClient) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + Config.api_token, // Replace with your Auth0 API Access Token
    });

    this.auth.user$.subscribe((user) => {
      if (user) {
        this.http.get<any[]>(`https://dc-auth-test-poc.us.auth0.com/api/v2/users`, {headers}).toPromise()
        .then((users) => {
         users.forEach((user) => {
            this.users.push({
              username: user.username ? user.username : "No username provided",
              email: user.email,
              verified: user.email_verified,
              user_id: user.user_id
            });
         });
        });
        console.log(this.users)
      }
    });
  }
}
