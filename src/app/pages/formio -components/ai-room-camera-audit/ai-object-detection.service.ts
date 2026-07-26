import { Injectable } from '@angular/core';
import { DetectionPrediction } from './ai-room-audit.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AiObjectDetectionService {
  private model: any = null;
  private isModelLoading = false;
  private modelLoadPromise: Promise<void> | null = null;

  constructor() {}

  async loadModel(): Promise<void> {
    if (this.model) {
      return Promise.resolve();
    }

    if (this.modelLoadPromise) {
      return this.modelLoadPromise;
    }

    this.isModelLoading = true;
    this.modelLoadPromise = (async () => {
      try {
        console.log('Loading TensorFlow.js...');
        const tf = await import('@tensorflow/tfjs');
        await tf.ready();
        
        console.log('Loading COCO-SSD model...');
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        
        this.model = await cocoSsd.load({
          base: 'lite_mobilenet_v2' // Load light-weight model for faster speed and mobile support
        });
        console.log('COCO-SSD model loaded successfully.');
      } catch (error) {
        console.error('Failed to load COCO-SSD model:', error);
        this.modelLoadPromise = null;
        this.isModelLoading = false;
        throw error;
      } finally {
        this.isModelLoading = false;
      }
    })();

    return this.modelLoadPromise;
  }

  isModelLoaded(): boolean {
    return this.model !== null;
  }

  async detect(videoElement: HTMLVideoElement): Promise<DetectionPrediction[]> {
    if (!this.model) {
      throw new Error('Model is not loaded. Call loadModel() first.');
    }

    try {
      const predictions = await this.model.detect(videoElement);
      return predictions.map((pred: any) => ({
        label: pred.class,
        confidence: pred.score,
        bbox: {
          x: pred.bbox[0],
          y: pred.bbox[1],
          width: pred.bbox[2],
          height: pred.bbox[3]
        }
      }));
    } catch (error) {
      console.error('Error running object detection:', error);
      throw error;
    }
  }

  dispose(): void {
    this.model = null;
    this.modelLoadPromise = null;
  }
}
