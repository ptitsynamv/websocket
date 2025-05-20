import {IError, IErrorModal, IUserInfo} from "../interfaces";

export class ErrorHandlerService {

  static errorSocket(error: IError): IErrorModal {
    let errorModal: IErrorModal = {
      isVisible: true,
      error: error,
    };
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
        errorModal.type = 'danger';
        break;
      default:
        errorModal.type = 'info';
    }
    return errorModal;
  }

  static errorSubscribe(error): IErrorModal {
    return {
      isVisible: true,
      error: {
        code: 500,
        message: error.error.message
      }
    };
  }
}
