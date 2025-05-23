import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DOMAIN } from '../store/states/landing.models';

@Injectable({
  providedIn: 'root',
})
export class LandingService {
  public GET_USER_NAME_BY_USERNAME = `${DOMAIN}/getUserByUserName.php`;
  public GET_LOGIN = `${DOMAIN}/getLogin.php`;
  public SET_USER_NAME = `${DOMAIN}/setUserName.php`;
  public INSERT_VISITOR = `${DOMAIN}/insertVisitor.php`;

  constructor(private httpClient: HttpClient) {}

  public getUserByUserName(username: string): Observable<any> {
    return this.httpClient
      .post(this.GET_USER_NAME_BY_USERNAME, {
        username: username,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public authenticateUser(
    email: string,
    given_name: string,
    family_name: string,
    picture: string,
    email_verified: boolean
  ): Observable<any> {
    return this.httpClient
      .post(this.GET_LOGIN, {
        userEmail: email,
        userEmailVerified: email_verified,
        userName: given_name,
        userSurname: family_name,
        picture: picture,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public setUserName(id_user: number, userName: string): Observable<any> {
    return this.httpClient
      .post(this.SET_USER_NAME, {
        id_user: id_user,
        userUserName: userName,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  public insertVisitor(section: string): Observable<any> {
    return this.httpClient
      .post(this.INSERT_VISITOR, {
        section: section,
      })
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}
