import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationPage, NotificationPageProps } from '../notification.page';
import { HttpService } from 'src/app/services/http/http.service';
import { AlertService } from 'src/app/services/alert/alert.service';
import { ScreenEnum } from 'src/app/core/enums/screen.enum';
import { AccessTypes } from 'src/app/core/enums/access.enum';
import { RecordStatus, RecordStatusNames } from 'src/app/core/enums/status.enum';

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.scss']
})
export class NotificationDetailsComponent implements OnInit {

  id!: number;
  title: any;
  body: any;
  showAll: any;
  pageProps!: NotificationPageProps;
  screenEnum = ScreenEnum;
  accessTypes = AccessTypes;
  recordStatus = RecordStatus;
  recordStatusNames = RecordStatusNames;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private notificationPage: NotificationPage,
    private http: HttpService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.pageProps = this.notificationPage.pageProps;
    // this.id = this.route.snapshot.params.id;
    // let params = this.route.snapshot.queryParams;
    // this.title = params?.title;
    // this.body = params?.body;
    // this.showAll = params?.showAll;
    if (this.pageProps.selectedObj)
      this.GetNoticationDetails();
  }

  back(): void {
    // this.showAll ?
    //   this.router.navigateByUrl("/page/notification?showAll=" + this.showAll) :
    this.location.back();
  };
  GetNoticationDetails() {
    this.pageProps.objDetails = null;
    let loginId = JSON.parse(localStorage.getItem('userData') || '{}').userId;
    let params = {
      UserId: +loginId,
      ObjectId: +this.pageProps?.selectedObj?.objectId,
      Screen: this.pageProps?.selectedObj?.screen
    }
    try {
      this.http.get2(`Notification/GetNotificationDetailsByScreen`, params).subscribe((val) => {
        if (val)
          this.pageProps.objDetails = val;
        // else
        //   this.alert.error("Failed To Load Details");
      });
    }
    catch (err) {
      this.alert.error("Failed To Load Details");
      console.log(err)
    }
  }
  go() {
    if (this.pageProps.selectedObj && this.pageProps.objDetails) {
      let screen = this.pageProps.selectedObj.screen;
      if (screen != this.screenEnum.CreatePlan && screen != this.screenEnum.UnAssignCHKUser &&
        screen != this.screenEnum.UnAssignRecordUser) {

        if (screen == this.screenEnum.AssignCHkUser)
          this.routeToChecklistRecords(this.pageProps.objDetails);

        if (screen == this.screenEnum.SubmitWorkflow || screen == this.screenEnum.ApproveWorkflow
          || screen == this.screenEnum.RejectWorkflow)
          this.routeWithWorkFlow(this.pageProps.objDetails);

        if (screen == this.screenEnum.AssignRecordUser) {
          if (this.recordStatus[this.pageProps.objDetails.recordStatusId] == this.recordStatusNames.Created || this.recordStatus[this.pageProps.objDetails.recordStatusId] == this.recordStatusNames.Assigned)
            this.routeIfCreatedOrAssigned(this.pageProps.objDetails);
          else {
            if (this.pageProps.objDetails.workflowId)
              this.routeWithWorkFlow(this.pageProps.objDetails);
            else
              this.routeWithNoWorkFlow(this.pageProps.objDetails);
          }
        }
      }
      else
        this.alert.info("No Details");
    }
    else
      this.alert.info("No Details");
  }
  routeToChecklistRecords(item: any) {
    this.router.navigateByUrl("/page/visits/" + item?.formId + "?categoryName=" + item?.categoryName
      + "&listName=" + item?.formTitle + "&categoryId=" + item?.categoryId);
  }
  routeWithWorkFlow(item: any) {
    console.log(item);

    if (item.access && (item.access.includes(this.accessTypes.Read) || item.access.includes(this.accessTypes.Update)))
      this.router.navigateByUrl("/page/workflow/details?Form_Id=" + item?.formId + "&Record_Id=" + +item?.formDataId)
    else {
      this.alert.error("You have No Access")
      return;
    }
  }
  routeWithNoWorkFlow(item: any) {
    if (item.access && (item.access.includes(this.accessTypes.Read) || item.access.includes(this.accessTypes.Update)))
      this.router.navigateByUrl("/page/checklist/" + +item?.formId + "?editMode=true&Complete=true" +
        "&offline=" + (item.offlineRef ? item.offlineRef : '') +
        "&listName=" + item.formTitle +
        "&Record_Id=" + +item.formDataId);
    else {
      this.alert.error("You have No Access")
      return;
    }
  }
  routeIfCreatedOrAssigned(item: any) {
    let complete = false;
    if (item.access && item.access.toString().includes(this.accessTypes.Read)) {
      if (!item.access.includes(this.accessTypes.Update))
        complete = true;
      this.router.navigateByUrl("/page/checklist/" + +item?.formId + "?editMode=true" +
        (complete == true ? "&Complete=true" : "") +
        "&offline=" + (item.offlineRef ? item.offlineRef : '') +
        "&listName=" + item.formTitle +
        "&Record_Id=" + +item.formDataId);
    }
    else {
      this.alert.error("You have No Access")
      return;
    }
  }
}
