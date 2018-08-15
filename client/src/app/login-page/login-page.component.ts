import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../shared/services/auth.service";
import {Subscription} from "rxjs";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {MaterialService} from "../shared/classes/material.service";

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
          //MaterialService.toast('now you can login in the system with you creads')
          console.log('now you can login in the system with you creads')
        } else if (params['accessDenied']) {
          //MaterialService.toast('You must authorize in the system')
          console.log('You must authorize in the system')
        } else if (params['cessionFailed']) {
          //MaterialService.toast('Please, login in the system')
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
        console.log(error.error.message);
        //MaterialService.toast(error.error.message);
        this.form.enable()
      }
    )
  }
}
