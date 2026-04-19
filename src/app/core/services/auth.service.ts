import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-base';
import { ResponseModel } from '../Interfaces/response-model';
import { LoginResponse } from '../Interfaces/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Matches `api/Auth` on the server (see Swagger). */
  private readonly apiUrl = `${API_BASE_URL}/Auth`;

  constructor(private http: HttpClient) { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      ...userData,
      clientUrl: window.location.origin
    });
  }
  confirmEmail(userId: string, code: string) {
    return this.http.post<ResponseModel<boolean>>(
      `${this.apiUrl}/confirm-email`,
      { userId, code }
    );
  }
  ForgetPassword(data: { userName: string }): Observable<any> {
    return this.http.post<ResponseModel<any>>(`${this.apiUrl}/forgot-password`, data);
  }
  ResetPassword(userId: string, code: string, data: any): Observable<any> {
    return this.http.post<ResponseModel<any>>(`${this.apiUrl}/reset-password?userId=${userId}&code=${code}`, data);
  }
  Login(userData: any): Observable<any> {
    return this.http.post<ResponseModel<LoginResponse>>(`${this.apiUrl}/login`, userData);
  }
  setSession(loginResponse: LoginResponse) {
    localStorage.setItem('token', loginResponse.token);
    localStorage.setItem('expiresOn', loginResponse.tokenExpiryTime.toString());
    localStorage.setItem('userId', loginResponse.userId);
    localStorage.setItem('fullName', loginResponse.fullName);
    localStorage.setItem('userName', loginResponse.userName);
    localStorage.setItem('role', loginResponse.role);
  }
  Logout() {
    localStorage.clear();
  }
}
