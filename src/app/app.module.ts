import { DateViewComponent } from './pages/calendar/date-view/date-view.component';
import { TokenInterceptor } from './core/interceptors/token.interceptors';
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
import { CardViewComponent } from './pages/calendar/card-view/card-view.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { FormioEditorModule } from '@davebaol/angular-formio-editor';
import { IonicStorageModule } from '@ionic/storage-angular';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { WorkflowComponent } from './pages/workflow/workflow.component';
import { PendingWorkflowComponent } from './pages/workflow/pending-workflow/pending-workflow.component';
import { HistoryWorkflowComponent } from './pages/workflow/history-workflow/history-workflow.component';
import { DetailsWorkflowComponent } from './pages/workflow/details-workflow/details-workflow.component';

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
    CardViewComponent,
    DateViewComponent,
    WorkflowComponent,
    PendingWorkflowComponent,
    HistoryWorkflowComponent,
    DetailsWorkflowComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    HttpClientModule,
    FormsModule,
    IonicStorageModule.forRoot(),
    FormioEditorModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-center',
    }),
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
