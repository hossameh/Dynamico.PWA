import { ChecklistComponent } from './pages/checklist/checklist.component';
import { AuthGard } from './core/gaurds/auth.guard';
import { CalendarComponent } from './pages/calendar/calendar.component';
import { NotificationComponent } from './pages/notification/notification.component';
import { PagesComponent } from './pages/pages.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SearchComponent } from './pages/search/search.component';
import { CompletedComponent } from './pages/visits/completed/completed.component';
import { PendingComponent } from './pages/visits/pending/pending.component';
import { VisitsComponent } from './pages/visits/visits.component';
import { CategoryComponent } from './pages/category/category.component';
import { HomeComponent } from './pages/home/home.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { LoginComponent } from './auth/login/login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path:'login',
    component:LoginComponent
  },
  {
    path:'forgot',
    component:ForgotPasswordComponent
  },
  {
    path:'page',
    component: PagesComponent,
    canActivateChild:[AuthGard],
    children:[
      {
        path:'home',
        component:HomeComponent
      },
      {
        path:'home/category/:id',
        component:CategoryComponent
      },
      {
        path:'visits/:id',
        component:VisitsComponent
      },
      {
        path:'pending',
        component:PendingComponent
      },
      {
        path:'completed',
        component:CompletedComponent
      },
      {
        path:'search',
        component:SearchComponent
      },
      {
        path:'profile',
        component:ProfileComponent
      },
      {
        path:'checklist/:id',
        component:ChecklistComponent
      },
      {
        path:'notification',
        component:NotificationComponent
      },
      {
        path:'calendar',
        component:CalendarComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
