import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { API_BASE_URL } from '../../../../core/config/api-base';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor (private http: HttpClient) {

  }
  onInit () {
    this.justTest()
  }
  justTest () {
    this.http
      .post(`${API_BASE_URL}/Auth/login`, {
        userName: 'system@admin.com',
        password: 'P@ssw0rd'
      })
      .subscribe(data => {
        console.log("Login Response:", data)
      })
  }
}
