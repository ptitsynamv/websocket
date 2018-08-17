import {IUserInfo} from "../interfaces";

export class User {
  private _user: IUserInfo = null;

  set(data: IUserInfo) {
    this._user = data;
  }

  get email(): string {
    if (this._user) {
      return this._user.email;
    }
  }

  get id(): string {
    if (this._user) {
      return this._user.id;
    }
  }

  get color(): string {
    if (this._user) {
      return this._user.color;
    }
  }

  get isMute(): boolean {
    return this._user.isMute;
  }

  get isBan(): boolean {
    return this._user.isBan;
  }

  get isAdmin(): boolean {
    return this._user.isAdmin;
  }

  get token():string{
    if (this._user) {
      return this._user.token;
    }
  }

}
