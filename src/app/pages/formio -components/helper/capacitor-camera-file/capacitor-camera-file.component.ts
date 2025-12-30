import { Components } from 'formiojs';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';

const BaseFileComponent = Components.components.file;

export class CapacitorCameraFileComponent extends BaseFileComponent {
  attach(element: HTMLElement) {
    super.attach(element);
    debugger
    const fileBrowseBtn = (this as any).refs?.toggleCameraMode || element.querySelector('[ref="toggleCameraMode"]');

    if (fileBrowseBtn) {
      fileBrowseBtn.addEventListener('click', async (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        try {
          const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.Base64,
            source: CameraSource.Camera,
            direction: CameraDirection.Rear,
          });

          const base64Data = `data:image/${image.format};base64,${image.base64String}`;
          const fileName = `photo-${Date.now()}.${image.format}`;
          const file = this.dataURLtoFile(base64Data, fileName);

          this.setFileData(file, base64Data);
        } catch (err) {
        }
      }, true);
    }

    return this.element;
  }

  dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
    return new File([u8arr], filename, { type: mime });
  }
  setFileData(file: File, base64Data: string) {
    const fileData = {
      name: file.name,
      storage: 'base64', // Assuming base64 storage, change if needed
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: base64Data

      
    };

    // Append the new file to existing dataValue array, or start a new one if empty
    if (!this.dataValue || !Array.isArray(this.dataValue)) {
      this.dataValue = [];
    }
    this.dataValue.push(fileData);

    // Update value and UI
    if (typeof (this as any).updateValue === 'function') {
      (this as any).updateValue(this.dataValue);
    } else if (typeof (this as any).setValue === 'function') {
      (this as any).setValue(this.dataValue);
    } else if (typeof (this as any).triggerChange === 'function') {
      (this as any).triggerChange();
    }

    if (typeof this.redraw === 'function') {
      this.redraw();
    }
  }
  
}
