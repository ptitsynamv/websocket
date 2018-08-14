import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {LoginPageComponent} from "./login-page/login-page.component";
import {ChatPageComponent} from "./chat-page/chat-page.component";
import {AppComponent} from "./app.component";
import {AuthGuard} from "./shared/classes/auth.guard";

const routes: Routes = [
  {
    path: '', component: AppComponent, children: [
      {path: '', redirectTo: '/login', pathMatch: 'full'},
      {path: 'login', component: LoginPageComponent},
      {
        path: 'chat',
        canActivate: [AuthGuard],
        component: ChatPageComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule {

}
