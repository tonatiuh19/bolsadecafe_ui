import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DOMAIN } from '../store/states/landing.models';

@Injectable({
  providedIn: 'root',
})
export class LandingService {
  public GET_LOGIN = `${DOMAIN}/getLogin.php`;
  public SET_USER_NAME = `${DOMAIN}/setUserName.php`;
  public INSERT_VISITOR = `${DOMAIN}/insertVisitor.php`;

  constructor(private httpClient: HttpClient) {}

  public authenticateUser(
    email: string,
    email_verified: boolean,
    given_name: string,
    family_name: string,
    picture: string,
    phone: number
  ): Observable<any> {
    return this.httpClient
      .post(this.GET_LOGIN, {
        bdec_user_email: email,
        bdec_user_email_verified: email_verified,
        bdec_user_name: given_name,
        bdec_user_last_name: family_name,
        bdec_user_picture: picture,
        bdec_user_phone: phone,
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
