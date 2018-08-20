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

  sendMessage(msg: {}) {
    this.socket.emit("message", msg);
  }

  getMessage() {
    return this.socket.fromEvent("message")
  }

  getUsers() {
    return this.socket.fromEvent("allUsers")
  }

  sendMute(msg: {}) {
    this.socket.emit("mute", msg);
  }

  getError() {
    return this.socket.fromEvent("serverError")
  }

  sendBan(msg: {}) {
    this.socket.emit("ban", msg);
  }

  getDisconnect() {
    return this.socket.fromEvent("disconnect")
  }

  sendGetPreviousMessage(msg: {}) {
    return this.socket.emit("getPreviousMessage", msg)
  }
}
