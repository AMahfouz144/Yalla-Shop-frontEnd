import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { API_BASE_URL } from '../../../../core/config/api-base';

@Component({
  selector: 'app-categories-grid',
  templateUrl: './categories-grid.component.html',
  styleUrl: './categories-grid.component.css'
})
export class CategoriesGridComponent {
 constructor(private http: HttpClient) { 
   this.justTest()
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
