import {Injectable} from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {Observable} from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ChatService {

  constructor(private socket: Socket) {
  }

  socketLogin(token: string) {
    this.socket.emit("login", token);
  }

  socketLogout(token: string) {
    this.socket.emit("logout", token);
  }

  sendMessage(msg: string) {
    this.socket.emit("message", msg);
  }

  getMessage() {
    return this.socket
      .fromEvent("message")
  }

  getLoginUsers() {
    return this.socket
      .fromEvent("onlineUsers")
  }

  sendMute(msg:string) {
    this.socket.emit("mute", msg);
  }

  getError(){
    return this.socket
      .fromEvent("serverError")
  }

}
