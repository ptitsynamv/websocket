import {ChatService} from "../shared/services/chat.service";
import {AuthService} from "../shared/services/auth.service";
import {Component, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import {Observable} from "rxjs/internal/Observable";
import {WebSocketSubject} from 'rxjs/webSocket';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {IUser, IUserInfo} from "../shared/interfaces";
import {Subscription} from "rxjs";

export class Message {
  constructor(
    public sender: string,
    public comment: string,
    public color: string,
  ) {
  }
}

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit, AfterViewInit, OnDestroy {
  form: FormGroup;
  _user: IUserInfo = null;
  aSub: Subscription;


  onlineUsers;
  messages = [];


  public serverMessages = new Array<Message>();

  constructor(private authService: AuthService,
              private chatService: ChatService,
              private router: Router
  ) {
  }

  ngOnInit() {
    this._user = this.authService.getUser();
    console.log('this._user', this.authService.getUser());

    this.chatService.socketLogin(this._user.token);

    this.form = new FormGroup({
      comment: new FormControl('masha', [Validators.required, Validators.min(1), Validators.max(200)])
    });

    this.chatService.getLoginUsers().subscribe(data => {
      let onlineUsersObject = JSON.parse(data.message);
      delete onlineUsersObject[this._user.id];
      this.onlineUsers = Object.values(onlineUsersObject);

      console.log('this.onlineUsers', this.onlineUsers);

    });

    this.chatService.getMessage().subscribe(data => {
      this.messages.push(data);
    });

  }


  ngAfterViewInit() {

  }

  ngOnDestroy() {
    if (this.aSub) {
      this.aSub.unsubscribe()
    }
  }

  public onSubmit(): void {
    const message = new Message(this._user.token, this.form.value.comment, this._user.color);

    this.serverMessages.push(message);
    this.chatService.sendMessage(<any>JSON.stringify(message));
  }

  logout() {
    this.chatService.socketLogout(this._user.token);
    this.authService.logout();
    this.router.navigate(['/login'])
  }

  getUserEmail(): string {
    if (this._user) {
      return this._user.email;
    }
  }

  getUserId(): string {
    if (this._user) {
      return this._user.id;
    }
  }

  getUserColor(): string {
    if (this._user) {
      return this._user.color;
    }
  }

  onMute(userId: string) {
    this.chatService.sendMute(<any>JSON.stringify({userId, sender: this._user.token}))
  }

}



