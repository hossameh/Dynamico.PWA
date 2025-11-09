import { DateViewComponent } from './pages/calendar/date-view/date-view.component';
import { TokenInterceptor } from './core/interceptors/token.interceptors';
import { Injector, NgModule } from '@angular/core';
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
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { FormioEditorModule } from '@davebaol/angular-formio-editor';
import { IonicStorageModule } from '@ionic/storage-angular';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { WorkflowComponent } from './pages/workflow/workflow.component';
import { PendingWorkflowComponent } from './pages/workflow/pending-workflow/pending-workflow.component';
import { HistoryWorkflowComponent } from './pages/workflow/history-workflow/history-workflow.component';
import { DetailsWorkflowComponent } from './pages/workflow/details-workflow/details-workflow.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { NotificationDetailsComponent } from './pages/notification/notification-details/notification-details.component';
import { initializeApp } from 'firebase/app';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {  NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QrScanComponent } from './pages/qr-scan/qr-scan.component';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { AssetsComponent } from './pages/assets/assets.component';
import { AssetsInfoComponent } from './pages/assets/assets-info/assets-info.component';
import { AssetsChecklistComponent } from './pages/assets/assets-checklist/assets-checklist.component';
import { AssetsDocumentsComponent } from './pages/assets/assets-documents/assets-documents.component';
import { AssetsListComponent } from './pages/assets/assets-list/assets-list.component';
import { ExternalLoginComponent } from './auth/external-login/external-login.component';
import { DocumentViewerComponent } from './pages/assets/document-viewer/document-viewer.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MobileChecklistComponent } from './pages/checklist/mobile-checklist/mobile-checklist.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SelectGroupComponent } from './pages/formio -components/select-group/select-group.component';
import { registerSelectGroupComponent } from './pages/formio -components/select-group/selectGroup-wrapper.forrmio';
import { RatingWrapperComponent } from './pages/formio -components/rating/rating-wrapper.component';
import { registerRatingComponent } from './pages/formio -components/rating/rating-wrapper.formio';
import { AppointmentComponent } from './pages/formio -components/appointment/appointment/appointment.component';
import { registerAppointmentComponent } from './pages/formio -components/appointment/appointment/appointment-wrapper.formio';
import { WorkflowControlComponent } from './pages/formio -components/workflow-control/workflow-control.component';
import { registerWorkflowControlComponent } from './pages/formio -components/workflow-control/workflow-control-wrapper.formio';
import localAr from '@angular/common/locales/ar-EG';
import { registerLocaleData } from '@angular/common';
import { ThankYouComponent } from './auth/thank-you/thank-you.component';

initializeApp(environment.firebase);
registerLocaleData(localAr);

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
    DetailsWorkflowComponent,
    ResetPasswordComponent,
    NotificationDetailsComponent,
    QrScanComponent,
    AssetsComponent,
    AssetsInfoComponent,
    AssetsChecklistComponent,
    AssetsDocumentsComponent,
    AssetsListComponent,
    ExternalLoginComponent,
    DocumentViewerComponent,
    MobileChecklistComponent,
    SelectGroupComponent,
    RatingWrapperComponent,
    AppointmentComponent,
    WorkflowControlComponent,
    ThankYouComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    NgxQRCodeModule,
    IonicStorageModule.forRoot(),
    FormioEditorModule,
    NgxDocViewerModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-center',
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    NgSelectModule,

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    TranslateService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(injector: Injector) {
    registerRatingComponent(injector);
    registerSelectGroupComponent(injector);
    registerWorkflowControlComponent(injector)
    registerAppointmentComponent(injector);
  }
}
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "assets/i18n/", ".json");
}
