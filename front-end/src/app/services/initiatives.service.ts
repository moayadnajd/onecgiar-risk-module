import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InitiativesService {
  backend_url = environment.backend_url;
  constructor(private http: HttpClient) {}

  get headers() {
    return {
      'content-type': 'application/json',
      authorization: 'Bearer ' + localStorage.getItem('token'),
    };
  }

  async getInitiatives(id = null): Promise<Array<any>> {
    if (id)
      return await firstValueFrom(
        this.http
          .get(this.backend_url + '/initiative/' + id + '/versions', {
            headers: this.headers,
          })
          .pipe(map((d: any) => d))
      );
    else
      return await firstValueFrom(
        this.http
          .get(this.backend_url + '/initiative', {
            headers: this.headers,
          })
          .pipe(map((d: any) => d))
      );
  }

  getInitiative(initiativeId: number):Promise<any> {
    return firstValueFrom(
      this.http
        .get(this.backend_url + '/initiative/' + initiativeId, {
          headers: this.headers,
        })
        .pipe(map((d:any)=>d))
    );
  }

  // roles
  getInitiativeRoles(initiativeId: number) {
    return this.http
      .get(this.backend_url + '/initiative/' + initiativeId + '/roles', {
        headers: this.headers,
      })
      .toPromise();
  }

  createNewInitiativeRole(initiativeId: number, role: any) {
    return this.http
      .post(
        this.backend_url + '/initiative/' + initiativeId + '/roles',
        {
          initiative_id: role.initiative_id,
          email: role.email,
          role: role.role,
        },
        { headers: this.headers }
      )
      .toPromise();
  }

  updateInitiativeRole(initiativeId: number, roleId: number, role: any) {
    return this.http
      .put(
        this.backend_url + '/initiative/' + initiativeId + '/roles/' + roleId,
        {
          initiative_id: role.initiative_id,
          id: role.id,
          email: role.email,
          role: role.role,
        },
        { headers: this.headers }
      )
      .toPromise();
  }

  deleteInitiativeRole(initiativeId: number, roleId: number) {
    return this.http
      .delete(
        this.backend_url + '/initiative/' + initiativeId + '/roles/' + roleId,
        { headers: this.headers }
      )
      .toPromise();
  }
}
