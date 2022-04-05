import { HttpService } from './../http/http.service';
import { map } from 'rxjs/operators';
import { HelperService } from './../helper.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConnectionService } from 'ng-connection-service';
import { ToastrService } from 'ngx-toastr';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  currentMessage = new BehaviorSubject(null);
  currentStatus: BehaviorSubject<any> = new BehaviorSubject(null);
  token: any;
  status = "Online";
  isConnected;
  constructor(
    private connectionService: ConnectionService,
    private toastr: ToastrService,
    private help: HelperService,
    private storage: Storage,
    private http: HttpService) {

    let status = navigator.onLine;
    this.isConnected = status;
    if (this.isConnected) {
      this.currentStatus.next(this.isConnected);
      this.status = "Online";
      this.SendToApi();
    }
    else {
      this.currentStatus.next(this.isConnected);
      this.toastr.error('', 'Offline Mode');
      this.status = "Offline";
    }


    this.connectionService.monitor().subscribe(isConnected => {
      this.currentStatus.next(isConnected);
      this.isConnected = isConnected;
      if (this.isConnected) {
        this.status = "Online";
        this.SendToApi();
      }
      else {
        this.toastr.error('', 'Offline Mode');
        this.status = "Offline";

      }
    });
  }

  async SendToApi() {
    let cacheRecords = await this.storage.get('Records') || [];
    if(cacheRecords.length > 0){
      cacheRecords.map((el:any , index:number) => {
        console.log('index',index);
        this.http.post('Records/SaveFormRecord', el).subscribe((res: any) => {

        });
        if(index == (cacheRecords.length-1) ){
          this.storage.remove('Records');
        }
      });

    }
  }

}
