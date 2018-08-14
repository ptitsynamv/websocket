export interface IUser extends IUserInfo{
  password: string,
}

export interface IUserInfo {
  token: string,
  email: string,
  isAdmin: boolean,
  isBan: boolean,
  isMute: boolean,
  color: string
}
