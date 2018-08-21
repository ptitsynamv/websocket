export interface IUser extends IUserInfo {
  password: string,
}

export interface IUserInfo {
  id: string
  token?: string,
  email: string,
  isAdmin: boolean,
  isBan: boolean,
  isMute: boolean,
  color?: string
}

export interface IMessage {
  color: string,
  comment: string,
  date: string,
  userId: string,
  userName: string,
}

export interface INewMessage {
  sender: string,
  comment: string
}

export interface IError {
  code: number,
  message: string
}


export interface IErrorModal {
  isVisible: boolean,
  error: IError,
  type?: string
}

