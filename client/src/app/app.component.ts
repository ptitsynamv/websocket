import {Component, OnInit} from '@angular/core';
import {AuthService} from "./shared/services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService) {

  }

  ngOnInit() {
    const potentialUser = localStorage.getItem('auth-user');
    if (potentialUser !== null) {
      this.auth.setUser(JSON.parse(potentialUser))
    }
  }
}
