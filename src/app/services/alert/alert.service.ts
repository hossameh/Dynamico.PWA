import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private toastr: ToastrService,
    private translate: TranslateService
  ) { }

  success(message: string) {
    this.toastr.success(message);
  }

  info(message: string) {
    this.toastr.info(message);
  }

  warning(message: string) {
    this.toastr.warning(message);
  }

  error(message: string) {
    this.toastr.error(message);
  }
  getTranslation(wordYouNeedToTranslate: string): string {
    return this.translate.instant(wordYouNeedToTranslate);
  }
  confirmDelete(message: string, title = this.getTranslation('Confirmation!')) {
    return Swal.fire({
      title: title,
      text: message,
      icon: "error",
      showCancelButton: true,
      confirmButtonColor: "#48b0f7",
      cancelButtonColor: "#d33",
      confirmButtonText: this.getTranslation(`Ok`),
      //customClass: {
      //  confirmButton: 'btn-sm',
      //  cancelButton: 'btn-sm',
      //  closeButton: 'btn-sm',
      //  denyButton:'btn-sm'
      //},
      cancelButtonText: this.getTranslation('Cancel'),
    });
  }
  confirmAny(message: string, confirmButtonText = this.getTranslation('Delete'), cancelButtonText = 'Cancel', confirmButtonColor = '#2F8BE6', cancelButtonColor = '#F55252') {
    return Swal.fire({
      title: this.getTranslation('Confirmation!'),
      text: `${message}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: confirmButtonColor,
      cancelButtonColor: cancelButtonColor,
      confirmButtonText: this.getTranslation(confirmButtonText),
      cancelButtonText: this.getTranslation(cancelButtonText),
      customClass: {
        confirmButton: 'btn btn-primary ',
        cancelButton: 'btn btn-danger ml-1 ',

      },
      // buttonsStyling: false,
    });
  }
  alertError(message: any, title = "Error") {
    Swal.fire({
      title: this.getTranslation(title),
      showClass: {
        popup: 'animated tada'
      },
      text: `${message}`,
      icon: "error",
      confirmButtonText: this.getTranslation('Ok'),
      customClass: {
        confirmButton: 'btn btn-primary'
      },
      buttonsStyling: false,
    });

  }
  alertInfo(message: any, title = "Attention") {
    Swal.fire({
      title: title,
      showClass: {
        popup: 'animated tada'
      },
      text: `${message}`,
      icon: "info",
      confirmButtonText: this.getTranslation('Ok'),
      customClass: {
        confirmButton: 'btn btn-primary'
      },
      buttonsStyling: false,
    });

  }
}
