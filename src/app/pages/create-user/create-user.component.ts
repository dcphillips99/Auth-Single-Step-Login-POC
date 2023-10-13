import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@auth0/auth0-angular';
import Config from '../../../../auth_config.json'

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css']
})
export class CreateUserComponent {
  userForm: FormGroup;

  constructor(private formBuilder: FormBuilder, public auth: AuthService, private http: HttpClient) {
    this.userForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    console.log("submitting form");
    if (this.userForm.valid) {

      let myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Authorization", "Bearer " + Config.api_token);
      
      const body = JSON.stringify({
        
        "email": this.userForm.value.email,
        "user_metadata": {},
        "blocked": false,
        "email_verified": false,
        "app_metadata": {},
        "given_name": "string",
        "family_name": "string",
        "name": this.userForm.value.name,
        "nickname": "string",
        "picture": "https://www.gravatar.com/avatar/",
        "user_id": Math.random().toString(36).substring(7),
        "connection": "Username-Password-Authentication",
        "password": this.userForm.value.password,
        "verify_email": false,
        "username": this.userForm.value.username

      });
  
      this.auth.user$.subscribe((user) => {
        if (user) {
          let requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: body
          };
          
          fetch("https://dc-auth-test-poc.us.auth0.com/api/v2/users", requestOptions)
            .then(response => response.text())
            .then(result => {
              console.log(result); 
              alert("User created successfully!");
              if (result.includes("already exists")) {
                alert("User already exists!");
              }
              else {
                alert("User created successfully!");
              }
              this.userForm.reset();
            })
            .catch(error => console.log('error', error));
        }
      });
    }

  }
}
