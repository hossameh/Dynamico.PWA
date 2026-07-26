import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AreaAuditPayload, AreaAuditResponse, RoomRecord } from './ai-room-audit.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AiCameraAuditService {
  private activeStream: MediaStream | null = null;

  constructor(private http: HttpClient) {}

  async startCamera(
    videoElement: HTMLVideoElement,
    facingMode: string = 'environment',
    width: number = 1280,
    height: number = 720,
    zoom: number = 1
  ): Promise<MediaStream> {
    if (this.activeStream) {
      this.stopCamera(videoElement);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser does not support getUserMedia API');
    }

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: facingMode === 'environment' ? { ideal: 'environment' } : 'user',
        width: { ideal: width },
        height: { ideal: height }
      },
      audio: false
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.activeStream = stream;
      videoElement.srcObject = stream;
      videoElement.setAttribute('playsinline', 'true');
      await videoElement.play();

      // Apply zoom if supported and requested
      if (zoom !== 1) {
        const track = stream.getVideoTracks()[0];
        if (track && typeof track.getCapabilities === 'function') {
          const capabilities = track.getCapabilities() as any;
          if (capabilities.zoom) {
            const zoomVal = Math.max(capabilities.zoom.min, Math.min(capabilities.zoom.max, zoom));
            try {
              await track.applyConstraints({
                advanced: [{ zoom: zoomVal }]
              } as any);
            } catch (e) {
              console.warn('Failed to apply zoom constraint:', e);
            }
          }
        }
      }

      return stream;
    } catch (error) {
      console.error('Error starting camera stream:', error);
      throw error;
    }
  }

  stopCamera(videoElement: HTMLVideoElement | null): void {
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(track => track.stop());
      this.activeStream = null;
    }
    if (videoElement) {
      videoElement.srcObject = null;
    }
  }

  captureFrame(videoElement: HTMLVideoElement, format: string = 'image/jpeg', quality: number = 0.85): string {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D canvas context');
    }

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(format, quality);
  }

  async resizeImage(dataUri: string, maxWidth: number = 1024, maxHeight: number = 768, quality: number = 0.85): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        } else {
          resolve(dataUri);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
      img.src = dataUri;
    });
  }

  async getRoomsList(endpoint: string): Promise<RoomRecord[]> {
    const res: any = await this.http.get(endpoint, { responseType: 'json' }).toPromise();
    if (Array.isArray(res)) {
      return res as RoomRecord[];
    }
    if (res && Array.isArray(res.data)) {
      return res.data as RoomRecord[];
    }
    if (res && Array.isArray(res.result)) {
      return res.result as RoomRecord[];
    }
    return [];
  }

  async sendAreaAudit(endpoint: string, payload: AreaAuditPayload): Promise<AreaAuditResponse> {
    if (!payload.image || !payload.image.dataUri) {
      throw new Error('No image payload available');
    }

    // 1. Convert base64 dataUri to Blob
    const fileBlob = this.dataUriToBlob(payload.image.dataUri);

    // 2. Prepare FormData
    const formData = new FormData();
    formData.append('file', fileBlob, `audit_${payload.areaKey}_${Date.now()}.jpg`);

    // 3. Send the labels of the detected objects we want evaluated
    const labels = (payload.detectedObjects || []).map(o => o.label).filter(l => !!l);
    for (const label of labels) {
      formData.append('labels', label);
    }
    formData.append('lang', payload.lang || 'en');

    // 4. Post to endpoint and receive response as Blob
    const responseBlob = await this.http.post(endpoint, formData, { responseType: 'blob' }).toPromise();
    if (!responseBlob) {
      throw new Error('Empty audit response');
    }

    // 5. Determine response type (JSON vs Image)
    if (responseBlob.type && responseBlob.type.includes('json')) {
      const jsonText = await this.blobToText(responseBlob);
      const jsonResult = JSON.parse(jsonText);
      return this.normalizeResponse(jsonResult, payload.areaKey);
    } else {
      // Binary Image fallback (endpoint that still returns an image blob)
      const annotatedDataUri = await this.blobToDataUri(responseBlob);
      return {
        areaKey: payload.areaKey,
        status: 'NeedsCorrection',
        score: 50,
        message: 'Audit processed. Image returned without structured score.',
        findings: [],
        responseImageUri: annotatedDataUri
      };
    }
  }

  private dataUriToBlob(dataUri: string): Blob {
    const byteString = atob(dataUri.split(',')[1]);
    const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  private blobToDataUri(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private blobToText(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(blob);
    });
  }

  private readonly passScoreThreshold = 80;
  private readonly needsCorrectionScoreThreshold = 50;

  private scoreToStatus(score: number): 'Pass' | 'NeedsCorrection' | 'Fail' {
    if (score >= this.passScoreThreshold) return 'Pass';
    if (score >= this.needsCorrectionScoreThreshold) return 'NeedsCorrection';
    return 'Fail';
  }

  private normalizeResponse(response: any, areaKey: string): AreaAuditResponse {
    const data = response?.result || response?.data || response;

    // Shape 1 (current): { annotatedImageUrl, overall: { score, comment } }
    if (data && data.overall && typeof data.overall.score === 'number') {
      const score = data.overall.score;
      return {
        areaKey: data.areaKey || areaKey,
        status: this.scoreToStatus(score),
        score,
        message: data.overall.comment || '',
        findings: [],
        responseImageUri: data.annotatedImageUrl || ''
      };
    }

    // Shape 2 (legacy): { status, score, message, findings }
    if (data && typeof data === 'object' && 'status' in data) {
      return {
        areaKey: data.areaKey || areaKey,
        status: data.status,
        score: typeof data.score === 'number' ? data.score : 80,
        message: data.message || '',
        findings: data.findings || [],
        needsHumanReview: !!data.needsHumanReview,
        humanReviewReason: data.humanReviewReason || '',
        responseImageUri: data.responseImageUri || data.image?.url || data.image?.dataUri || ''
      };
    }

    throw new Error('Unsupported audit response structure');
  }
}
