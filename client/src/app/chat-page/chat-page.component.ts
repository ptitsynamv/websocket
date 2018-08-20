import {ChatService} from "../shared/services/chat.service";
import {AuthService} from "../shared/services/auth.service";
import {Component, ViewChild, ElementRef, OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {IUser, IUserInfo, IMessage, INewMessage, IError} from "../shared/interfaces";
import {Subscription} from "rxjs";
import {ErrorHandlerService} from "../shared/classes/errorHandler.service"
import {User} from "../shared/classes/user.service";

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit, OnDestroy {
  private form: FormGroup;
  private aSub: Subscription[] = [];
  private paginationSkip = 0;
  private paginationLimit = 2;

  user = new User();
  users: IUserInfo[] = [];
  messages: IMessage[] = [];
  isExistPreviousMessage: boolean = true;
  isCanSendMessage: boolean = true;
  loading: number [] = [1, 1];

  constructor(private authService: AuthService,
              private chatService: ChatService,
              private router: Router
  ) {
  }

  ngOnInit() {
    const userSub = this.authService.getUser().subscribe(
      (data: IUserInfo) => {
        this.user.set(data);
      },
      error => ErrorHandlerService.errorSubscribe(error)
    );

    const usersSub = this.chatService.getUsers().subscribe(
      (data: IUserInfo) => {
        this.authService.setUser(data[this.user.id]);
        delete data[this.user.id];
        this.users = Object.values(data);
        this.loading.pop();
      },
      error => ErrorHandlerService.errorSubscribe(error)
    );

    const messageSub = this.chatService.getMessage().subscribe(
      (data: {
        isNewMessage: boolean,
        message: IMessage[]
      }) => {
        if (data.message.length < this.paginationLimit && !data.isNewMessage) {
          this.isExistPreviousMessage = false;
        }
        data.message.forEach(value => this.messages.push(value));
        this.messages.sort(compare);
        this.loading.pop();
      },
      error => ErrorHandlerService.errorSubscribe(error)
    );

    const disconnectSub = this.chatService.getDisconnect().subscribe(
      data => {
        this.logout();
      },
      error => ErrorHandlerService.errorSubscribe(error)
    );

    const errorsSub = this.chatService.getError().subscribe(
      (data: IError) => {
        if (data.code === 401) {
          this.logout();
        }
        ErrorHandlerService.errorSocket(data);
      },
      error => ErrorHandlerService.errorSubscribe(error)
    );

    this.aSub.push(userSub);
    this.aSub.push(usersSub);
    this.aSub.push(messageSub);
    this.aSub.push(disconnectSub);
    this.aSub.push(errorsSub);

    this.chatService.socketLogin(this.user.token);

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

  onSubmit(): void {
    if (this.user.isMute || this.user.isBan || !this.isCanSendMessage) {
      return;
    }
    this.isCanSendMessage = false;

    const newMessage: INewMessage = {
      sender: this.user.token,
      comment: this.form.value.comment,
    };
    this.chatService.sendMessage(newMessage);

    setTimeout(() => {
      this.isCanSendMessage = true;
    }, 15000);
  }

  logout() {
    this.chatService.socketLogout(this.user.token);
    this.authService.logout();
    this.router.navigate(['/login'])
  }

  onMute(userForMuteId: string) {
    if (!this.user.isAdmin) {
      return;
    }
    this.chatService.sendMute({
      userForMuteId: userForMuteId,
      sender: this.user.token
    })
  }

  onBan(userForBanId: string) {
    if (!this.user.isAdmin) {
      return;
    }
    this.chatService.sendBan({
      userForBanId: userForBanId,
      sender: this.user.token
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

function compare(a: IMessage, b: IMessage): number {
  return Date.parse(a.date) <= Date.parse(b.date) ? -1 : 1;
}

