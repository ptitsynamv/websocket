import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../shared/services/auth.service";
import {Subscription} from "rxjs";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {ErrorHandlerService} from "../shared/classes/errorHandler.service";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit, OnDestroy {
  form: FormGroup;
  aSub: Subscription;

  constructor(private auth: AuthService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(5)])
    });

    this.route.queryParams.subscribe(
      (params: Params) => {
        if (params['registered']) {
          console.log('now you can login in the system with you creads')
        } else if (params['accessDenied']) {
          console.log('You must authorize in the system')
        } else if (params['cessionFailed']) {
          console.log('Please, login in the system')
        }
      }
    )
  }

  ngOnDestroy() {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
  }

  onSubmit() {
    this.form.disable();
    this.aSub = this.auth.login(this.form.value).subscribe(
      () => this.router.navigate(['/chat']),
      error => {
        ErrorHandlerService.errorSubscribe(error);
        this.form.enable()
      },
      () => {
        this.form.enable()
      }
    )
  }
}
