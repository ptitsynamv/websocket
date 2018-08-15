import {Injectable} from "@angular/core";
import {IUser, IUserInfo} from "../interfaces";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";


// export class User implements IUserInfo {
//   private _email: string;
//   private _token: string = null;
//   private _isAdmin: boolean = false;
//   private _isBan: boolean = false;
//   private _isMute: boolean = false;
//   private _color: string;
//
//   constructor(newUser: User) {
//     this._token = newUser.token;
//     this._email = newUser.email;
//     this._isAdmin = newUser.isAdmin;
//     this._isBan = newUser.isBan;
//     this._isMute = newUser.isMute;
//     this._color = newUser.color;
//   }
//
//   // public get email() {
//   //   return this._email;
//   // }
//   //
//   // public set email(email) {
//   //   this._email = email;
//   // }
//   //
//   // public get token() {
//   //   return this._token;
//   // }
//   //
//   // public set token(token) {
//   //   this._token = token;
//   // }
//   //
//   // public get isAdmin() {
//   //   return this._isAdmin;
//   // }
//   //
//   // public get isBan() {
//   //   return this._isBan;
//   // }
//   //
//   // public get isMute() {
//   //   return this._isMute;
//   // }
//   //
//   // public get color() {
//   //   return this._color;
//   // }
//   //
//   // public set isAdmin(isAdmin) {
//   //   this._isAdmin = isAdmin;
//   // }
//   //
//   // public set isBan(isBan) {
//   //   this._isBan = isBan;
//   // }
//   //
//   // public set isMute(isMute) {
//   //   this._isMute = isMute;
//   // }
//   //
//   // public set color(color) {
//   //   this._color = color;
//   // }
// }


@Injectable({
  providedIn: "root"
})

export class AuthService {
  private _user: IUserInfo = null;

  constructor(private http: HttpClient) {
  }

  login(user: IUserInfo): Observable<IUserInfo> {
    return this.http.post<IUserInfo>('/api/auth/login', user)
      .pipe(
        tap(
          (newUser: IUserInfo) => {
            localStorage.setItem('auth-user', JSON.stringify(newUser));
            this.setUser(newUser);
          }
        )
      )
  }

  setUser(user: IUserInfo) {
    this._user = user;
  }

  getToken(): string {
    return this._user.token
  }

  isAuthtenticated(): boolean {
    return !!this._user
  }

  logout() {
    this.setUser(null);
    localStorage.clear();
  }

  getUser(): IUserInfo {
    return this._user;
  }
}
