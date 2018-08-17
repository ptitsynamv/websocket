import {IError} from "../interfaces";


export class ErrorHandlerService {

  static errorSocket(error: IError) {

    console.warn('getError', error);

    switch (error.code) {
      case 400:
        break;
      case 401:
        break;
      case 403:
        break;
      case 404:
        break;
      case 500:
        break;
      default:

    }
  }

  static errorSubscribe(error){
    console.warn('errorSubscribe', error);
  }

  static modal(){

  }

}
