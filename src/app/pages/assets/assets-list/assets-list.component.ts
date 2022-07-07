import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { HelperService } from 'src/app/services/helper.service';
import { HttpService } from 'src/app/services/http/http.service';
import { OfflineService } from 'src/app/services/offline/offline.service';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss']
})
export class AssetsListComponent implements OnInit {

  isOnline = true;
  assets: any = [];
  $subscription!: Subscription;
  constructor(private http: HttpService,
    private helper: HelperService,
    private offline: OfflineService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.$subscription = this.offline.currentStatus.subscribe(isOnline => {
      this.isOnline = isOnline;
      if (isOnline) {
        this.getAssets();
      }
    });
  }
  getAssets() {
    this.http.get(`Assets/GetUserAssets`, null).subscribe((res: any) => {      
      this.assets = res;
    })
  }

}
