import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { MainService } from './main.service';
@Injectable({
  providedIn: 'root',
})
export class UserService extends MainService {
  constructor(private http: HttpClient) {
    super();
  }

  async login(email: string) {
    let result = await firstValueFrom(
      this.http
        .post(this.backend_url + `/auth/login`, {
          username: email,
          password: '123',
        })
        .pipe(map((d) => d))
    ).catch((e) => false);

    return result;
  }

  async getUsers() {
    return firstValueFrom(
      this.http
        .get(this.backend_url + `/users`, {
          headers: this.headers,
        })
        .pipe(map((d) => d))
    ).catch((e) => false);
  }

  async addUser(data:any) {
    return firstValueFrom(
      this.http
        .post(this.backend_url + `/users`,data, {
          headers: this.headers,
        })
        .pipe(map((d) => d))
    ).catch((e) => false);
  }

  async updateUser(data:any) {
    return firstValueFrom(
      this.http
        .put(this.backend_url + `/users`,data, {
          headers: this.headers,
        })
        .pipe(map((d) => d))
    ).catch((e) => false);
  }
  async deleteUser(id:any) {
    return firstValueFrom(
      this.http
        .delete(this.backend_url + `/users/${id}`, {
          headers: this.headers,
        })
        .pipe(map((d) => d))
    ).catch((e) => false);
  }

  getLogedInUser(): any {
    return jwt_decode(localStorage.getItem('access_token') as string);
  }
}
