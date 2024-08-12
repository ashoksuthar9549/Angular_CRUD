import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { UsersComponent } from './components/user-details/users/users.component';
import { HttpClientModule } from '@angular/common/http';
import { AddUserComponent } from './components/user-details/add-user/add-user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchUserComponent } from './components/user-details/search-user/search-user.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    UserDetailsComponent,
    UsersComponent,
    AddUserComponent,
    SearchUserComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
