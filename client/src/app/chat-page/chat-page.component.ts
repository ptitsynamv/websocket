import {ChatService} from "../shared/services/chat.service";
import {AuthService} from "../shared/services/auth.service";
import {Component, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import {Observable} from "rxjs/internal/Observable";
import {WebSocketSubject} from 'rxjs/webSocket';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {IUser, IUserInfo, IMessage, INewMessage} from "../shared/interfaces";
import {Subscription} from "rxjs";

export class Message {
  constructor(
    public sender: string,
    public comment: string,
  ) {
  }
}

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit, OnDestroy {
  private form: FormGroup;
  private _user: IUserInfo = null;
  private aSub: Subscription[] = [];
  private paginationSkip = 0; //same on server
  private paginationLimit = 2;

  onlineUsers;
  messages: IMessage[] = [];
  isExistPreviousMessage: boolean = true;
  isCanSendMessage: boolean = true;

  constructor(private authService: AuthService,
              private chatService: ChatService,
              private router: Router
  ) {
  }

  ngOnInit() {
    const userSub = this.authService.getUser().subscribe(data => {
      console.log('CURRENT', data);
      this._user = data;
    });

    const usersSub = this.chatService.getUsers().subscribe((data: IUserInfo) => {
      this.authService.setUser(data[this._user.id]);
      delete data[this._user.id];
      this.onlineUsers = Object.values(data);
    });

    const messageSub = this.chatService.getMessage().subscribe((data: IMessage[]) => {
      if (data.length < this.paginationLimit) {
        this.isExistPreviousMessage = false;
      }
      data.forEach(value => this.messages.push(value));
      this.messages.sort(compare);
    });

    const disconnectSub = this.chatService.getDisconnect().subscribe(data => {
      console.log('getDisconnect', data);
      this.logout();
    });

    const errorsSub = this.chatService.getError().subscribe(data => {
      console.warn('getError', data);
    });

    this.aSub.push(userSub);
    this.aSub.push(usersSub);
    this.aSub.push(messageSub);
    this.aSub.push(disconnectSub);
    this.aSub.push(errorsSub);

    this.chatService.socketLogin(this._user.token);

    this.form = new FormGroup({
      comment: new FormControl('masha', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(200)
      ])
    });
  }

  ngOnDestroy() {
    if (this.aSub) {
      this.aSub.forEach(s => s.unsubscribe())
    }
  }

  public onSubmit(): void {
    if (this._user.isMute || this._user.isBan || !this.isCanSendMessage) {
      return;
    }
    this.isCanSendMessage = false;

    const newMessage: INewMessage = {
      token: this._user.token,
      comment: this.form.value.comment,
    };
    this.chatService.sendMessage(newMessage);

    setTimeout(() => {
      this.isCanSendMessage = true;
    }, 15000);

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

  onMute(userForMuteId: string) {
    if (!this._user.isAdmin) {
      return;
    }
    this.chatService.sendMute({
      userForMuteId: userForMuteId,
      sender: this._user.token
    })
  }

  isUserMute(): boolean {
    return this._user.isMute;
  }

  isUserAdmin(): boolean {
    return this._user.isAdmin;
  }

  onBan(userForBanId: string) {
    if (!this._user.isAdmin) {
      return;
    }
    this.chatService.sendBan({
      userForBanId: userForBanId,
      sender: this._user.token
    })
  }

  showPreviousMessage(event: Event) {
    event.preventDefault();
    this.paginationSkip += this.paginationLimit;

    this.chatService.sendGetPreviousMessage({
      paginationSkip: this.paginationSkip,
      paginationLimit: this.paginationLimit
    });
  }
}

function compare(a: IMessage, b: IMessage) {
  if (a.date < b.date)
    return -1;
  if (a.date > b.date)
    return 1;
  return 0;
}

