import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { CategoryComponent } from './pages/category/category.component';
import { VisitsComponent } from './pages/visits/visits.component';
import { PendingComponent } from './pages/visits/pending/pending.component';
import { CompletedComponent } from './pages/visits/completed/completed.component';
import { SearchComponent } from './pages/search/search.component';
import { ChecklistComponent } from './pages/checklist/checklist.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationComponent } from './pages/notification/notification.component';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { PagesComponent } from './pages/pages.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ForgotPasswordComponent,
    NavbarComponent,
    HomeComponent,
    CategoryComponent,
    VisitsComponent,
    PendingComponent,
    CompletedComponent,
    SearchComponent,
    ChecklistComponent,
    ProfileComponent,
    NotificationComponent,
    CalendarComponent,
    PagesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
