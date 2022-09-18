import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class NotificationPage {
    pageProps: NotificationPageProps = {
        selectedObj: {},
        objDetails: {},
        showAll: false
    }

}

export interface NotificationPageProps {
    selectedObj: any;
    objDetails: any;
    showAll: boolean;
}