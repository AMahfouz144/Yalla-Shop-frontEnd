import { HttpClient } from '@angular/common/http'
import { Component } from '@angular/core'

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
      .post('https://yallashop-api.runasp.net/api/Auth/login', {
        userName: 'system@admin.com',
        password: 'P@ssw0rd'
      })
      .subscribe(data => {
        console.log("Login Response:", data)
      })
  }
}
