import {Injectable} from "@angular/core";
import {IUser, IUserInfo} from "../interfaces";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {of, from} from "rxjs";
import {ErrorHandlerService} from "../classes/errorHandler.service"

class BehaviorSubjectUser<T> extends BehaviorSubject<T> {
  constructor(private valueUser: T) {
    super(valueUser);
  }

  next(value: T): void {
    super.next(this.valueUser = Object.assign({}, this.valueUser, value));
  }
}


@Injectable({
  providedIn: "root"
})

export class AuthService {
  private _user = new BehaviorSubjectUser<IUserInfo>(null);

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
    this._user.next(user)
  }

  isAuthtenticated(): boolean {
    if (this._user.value && this._user.value.isBan) {
      ErrorHandlerService.errorSocket({code: 403, message: 'Current user isBan'})
    }
    return !!(this._user.value && !this._user.value.isBan)
  }

  logout() {
    this.setUser(null);
    localStorage.clear();
  }

  getUser(): Observable<IUserInfo> {
    return this._user;
  }
}
