import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from 'src/app/models/auth';
import { environment } from 'src/environments/environment.development';
import { CookieService } from 'ngx-cookie-service';
import jwt_decode from 'jwt-decode';
import { CustomEncoder } from 'src/app/shared/custom-encoder';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  jwtToken: string = '';
  decodedToken: { [key: string]: string } = {};

  constructor(private httpClient: HttpClient, private cookie: CookieService) { }

  public get isLoggedIn(): boolean {
    return !!this.cookie.get('Token');
  }

  confirmEmail(token: string, email: string) {
    let params = new HttpParams({ encoder: new CustomEncoder() })
    params = params.append('token', token);
    params = params.append('email', email);

    return this.httpClient.get(`${environment.apiUrl}auth/EmailConfirmation`, { params: params })
  }

  login(auth: Auth) {
    return this.httpClient.post(`${environment.apiUrl}auth/Login`, auth, {withCredentials:true});
  }

  signup(auth: Auth) {
    return this.httpClient.post(`${environment.apiUrl}auth/Signup`, auth, {withCredentials:true});
  }

  logout() {
    return this.httpClient.post<boolean>(`${environment.apiUrl}auth/Logout`, null, {withCredentials:true});
  }

  public setToken(): void {
    const token = this.cookie.get('Token')
    if (token) {
      this.jwtToken = token;
      this.decodedToken = jwt_decode(this.jwtToken);
    }
  }

  public getUserName(): string {
    return this.decodedToken && this.decodedToken['name'];
  }

  public getEmail(): string {
    return this.decodedToken && this.decodedToken['email'];
  }
}

