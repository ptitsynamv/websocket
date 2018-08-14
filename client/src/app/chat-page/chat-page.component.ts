import {ChatService} from "../shared/services/chat.service";
import {AuthService} from "../shared/services/auth.service";
import {Component, ViewChild, ElementRef, OnInit, AfterViewInit} from '@angular/core';
import {Observable} from "rxjs/internal/Observable";
import {WebSocketSubject} from 'rxjs/webSocket';
import {FormControl, FormGroup, Validators} from "@angular/forms";

export class Message {
  constructor(
    public sender: string,
    public comment: string,
    // public isBroadcast = false,
  ) {
  }
}

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit {
  //@ViewChild('viewer') private viewer: ElementRef;
  form: FormGroup;

  public serverMessages = new Array<Message>();
  public sender = '';

  constructor(private authService: AuthService,
              private chatService: ChatService
  ) {
  }

  ngOnInit() {
    this.sender = this.authService.getToken();

    console.log('getUserInfo', this.authService.getUserInfo());


    this.form = new FormGroup({
      comment: new FormControl('masha', [Validators.required, Validators.min(1), Validators.max(200)])
    });
  }


  public onSubmit(): void {
    const message = new Message(this.sender, this.form.value.comment);

    console.log('message', message);

    this.serverMessages.push(message);
    this.chatService.sendMessage(<any>JSON.stringify(message));
  }
}



