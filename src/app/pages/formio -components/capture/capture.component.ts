import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormioCustomComponent, FormioEvent } from 'angular-formio';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

/** A single watermark entry to be drawn onto a captured image. */
interface WatermarkEntry {
  text: string;
  /** Normalised position key: 'top-left' | 'top-center' | 'top-right' |
   *  'bottom-left' | 'bottom-center' | 'bottom-right' */
  position: string;
}

/**
 * Module-level image cache keyed by the form-field's unique `key`.
 *
 * WHY module-level and not instance-level?
 *
 * Form.io's angular-formio renderer can DESTROY and RECREATE the Angular Element
 * (web component) at any point during its value-update / re-render cycle. All
 * instance-level state — including flags like `_loaded` and arrays like `images` —
 * is lost on destruction. By storing captured images in a module-scoped Map keyed
 * on the form field's `key`, the data survives component recreation and eliminates
 * the "image appears then immediately disappears" bug.
 */
const _captureImageCache = new Map<string, any[]>();

/**
 * Clear the entire capture image cache.
 *
 * Call this when the parent form page (e.g. ChecklistComponent) initialises so
 * that stale images from a previous form session are discarded.  This replaces
 * the per-component "delete on firstChange" strategy which was unsafe because
 * Form.io re-renders (e.g. triggered by language emissions) destroy and
 * recreate the component — and the recreation's firstChange would wipe data
 * that should have survived.
 */
export function clearCaptureCache(): void {
  _captureImageCache.clear();
}

@Component({
  selector: 'app-capture',
  templateUrl: './capture.component.html',
  styleUrls: ['./capture.component.scss'],
})
export class CaptureComponent
  implements FormioCustomComponent<any[]>, OnInit, OnChanges
{
  // ── FormioCustomComponent contract ────────────────────────────────────────

  @Input() value: any[] = [];
  @Output() valueChange = new EventEmitter<any[]>();
  @Input() disabled: boolean = false;
  formioEvent?: EventEmitter<FormioEvent>;

  /**
   * Unique form-field key, passed automatically by angular-formio.
   * Used as the cache key in the module-level image store.
   */
  @Input() key: string = '';

  // ── Schema field options passed by Form.io ────────────────────────────────

  @Input() multiple: boolean = false;
  @Input() storage: string = 'base64';
  @Input() url: string = '';
  @Input() dir: string = '';
  @Input() fileNameTemplate: string = '';
  @Input() maxSize: number = 0;
  @Input() fileMinSize: number = 0;
  @Input() fileMaxSize: number = 0;
  @Input() filePattern: string = '';
  @Input() image: boolean = true;
  @Input() imageSize: string = '';
  /** If true, a date/time watermark is stamped onto the captured image. */
  @Input() showWatermark: boolean = false;
  /** Corner where the watermark is placed: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'. */
  @Input() watermarkPosition: string = 'bottom-right';
  /** If true, GPS coordinates are stamped onto the captured image. */
  @Input() showLocationWatermark: boolean = false;
  /** Corner where the GPS watermark is placed. */
  @Input() locationWatermarkPosition: string = 'bottom-right';

  // ── UI-only state (not image data — that lives in the module-level cache) ─

  capturing = false;

  // ── Images — backed by module-level cache (survives component recreation) ─

  /** Current captured images. Reads from the module-level cache. */
  get images(): any[] {
    return _captureImageCache.get(this.key) ?? [];
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Nothing to do — images getter reads directly from module-level cache.
  }

  ngOnChanges(changes: SimpleChanges): void {
    // ── Handle key migration ─────────────────────────────────────────────────
    // Angular Elements (web components) may bind `value` BEFORE `key`.  When
    // that happens the first `value` change stores data under key === ''.
    // Once the real key arrives we migrate that data to the correct bucket.
    if (changes['key']) {
      const oldKey: string = changes['key'].previousValue || '';
      const newKey: string = changes['key'].currentValue || '';
      if (oldKey !== newKey && _captureImageCache.has(oldKey)) {
        const cached = _captureImageCache.get(oldKey)!;
        if (cached.length > 0) {
          _captureImageCache.set(newKey, cached);
          _captureImageCache.delete(oldKey);
        }
      }
    }

    // ── Handle value changes ─────────────────────────────────────────────────
    if (!changes['value']) return;

    const incoming = changes['value'].currentValue;
    const isFirst: boolean = changes['value'].firstChange;

    if (Array.isArray(incoming) && incoming.length > 0) {
      // Real data from Form.io (prefill, edit-mode, or correct echo of our emit).
      _captureImageCache.set(this.key, [...incoming]);

    } else if (incoming && !Array.isArray(incoming) && typeof incoming === 'object' && 'url' in incoming) {
      // Form.io unwrapped the array and passed the single object
      _captureImageCache.set(this.key, [incoming]);

    } else if (isFirst && !_captureImageCache.has(this.key)) {
      // First binding with no data AND no cached data for this key.
      // This is a genuinely new record — nothing to do (cache is already empty).
      // NOTE: We intentionally do NOT delete from cache here.  If cache already
      // holds data for this key it means the component was recreated by Form.io
      // (e.g. after a language change emission) and the cached data must survive.
      // Stale cache from *previous form sessions* is handled by the parent
      // calling clearCaptureCache() on init.
    }
    // Non-first + empty/null → Form.io's round-trip echo. Intentionally ignored.
  }

  // ── Public helpers ────────────────────────────────────────────────────────

  get showCaptureButton(): boolean {
    if (this.disabled) return false;
    if (!this.multiple && this.images.length > 0) return false;
    return true;
  }

  async openCamera(): Promise<void> {
    if (this.capturing || !this.showCaptureButton) return;
    this.capturing = true;
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        direction: CameraDirection.Rear,
      });

      // ── Build watermark entries ────────────────────────────────────────────
      const watermarkEntries: WatermarkEntry[] = [];

      if (this.showWatermark) {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const dateLabel =
          `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ` +
          `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        watermarkEntries.push({
          text: dateLabel,
          position: this.watermarkPosition || 'bottom-right',
        });
      }

      if (this.showLocationWatermark) {
        try {
          const geoPos = await Geolocation.getCurrentPosition({
            timeout: 8000,
            enableHighAccuracy: true,
          } as any);
          const lat = geoPos.coords.latitude;
          const lng = geoPos.coords.longitude;
          const locationLabel =
            `${Math.abs(lat).toFixed(6)}°${lat >= 0 ? 'N' : 'S'}, ` +
            `${Math.abs(lng).toFixed(6)}°${lng >= 0 ? 'E' : 'W'}`;
          watermarkEntries.push({
            text: locationLabel,
            position: this.locationWatermarkPosition || 'bottom-right',
          });
        } catch (geoErr) {
          console.warn('Geolocation unavailable for watermark:', geoErr);
          watermarkEntries.push({
            text: 'Location unavailable',
            position: this.locationWatermarkPosition || 'bottom-right',
          });
        }
      }

      // Apply watermarks if any are configured
      let finalBase64: string;
      if (watermarkEntries.length > 0) {
        finalBase64 = await this.applyWatermarks(photo.base64String!, photo.format, watermarkEntries);
      } else {
        finalBase64 = `data:image/${photo.format};base64,${photo.base64String}`;
      }

      const base64Strip = finalBase64.split(',')[1] ?? photo.base64String!;
      const byteLength = Math.round((base64Strip.length * 3) / 4);

      // Validate max size (fileMaxSize in MB)
      if (this.fileMaxSize && this.fileMaxSize > 0) {
        const maxBytes = this.fileMaxSize * 1024 * 1024;
        if (byteLength > maxBytes) {
          console.warn(`Captured image exceeds maximum file size of ${this.fileMaxSize} MB`);
          return;
        }
      }

      const fileData = {
        name: this.buildFileName(photo.format),
        originalName: `capture.${photo.format}`,
        size: byteLength,
        type: `image/${photo.format}`,
        url: finalBase64,
        storage: 'base64',
      };

      const updated = this.multiple
        ? [...this.images, fileData]
        : [fileData];

      // Write to the module-level cache BEFORE emitting. This ensures that even
      // if Form.io synchronously pushes back an empty value (round-trip echo)
      // during or right after the emit call, the cached data is already correct
      // and the `images` getter will return the right value for the template.
      _captureImageCache.set(this.key, updated);

      // Sync @Input() value before emitting so Form.io reads the correct value
      // from the DOM element's property when it processes the event.
      this.value = this.multiple ? updated : (updated.length > 0 ? updated[0] : null as any);
      this.valueChange.emit(this.value);

    } catch (err: any) {
      if (err?.message !== 'User cancelled photos app') {
        console.error('Capture error:', err);
      }
    } finally {
      this.capturing = false;
    }
  }

  removeImage(index: number): void {
    if (this.disabled) return;
    const updated = this.images.filter((_, i) => i !== index);
    if (updated.length === 0) {
      // User explicitly cleared all images — delete from cache so a subsequent
      // non-first empty echo does NOT resurrect stale images.
      _captureImageCache.delete(this.key);
    } else {
      _captureImageCache.set(this.key, updated);
    }
    this.value = this.multiple ? [...updated] : (updated.length > 0 ? updated[0] : null as any);
    this.valueChange.emit(this.value);
  }

  async downloadImage(img: any) {
    if (!img.url) return;

    if (img.url.startsWith('http')) {
      try {
        const response = await fetch(img.url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = img.name || img.originalName || 'capture.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
      } catch (err) {
        console.error('Failed to download image:', err);
        const a = document.createElement('a');
        a.href = img.url;
        a.target = '_blank';
        a.download = img.name || img.originalName || 'capture.jpg';
        a.click();
      }
    } else {
      const a = document.createElement('a');
      a.href = img.url;
      a.download = img.name || img.originalName || 'capture.jpg';
      a.click();
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private buildFileName(format: string): string {
    if (this.fileNameTemplate) {
      return this.fileNameTemplate
        .replace('{{timestamp}}', Date.now().toString())
        .replace('{{format}}', format);
    }
    return `capture_${Date.now()}.${format}`;
  }

  /**
   * Draws one or more watermark entries onto the captured image and returns a
   * data-URL with all watermarks baked in.
   *
   * Entries that share the same position are stacked vertically so they never
   * overlap. Top-group entries stack downward from the top edge; bottom-group
   * entries stack upward so the last line is always closest to the bottom edge.
   *
   * Supported positions: top-left | top-center | top-right |
   *                       bottom-left | bottom-center | bottom-right
   *
   * @param rawBase64  Raw base64 string (NO "data:image/...;base64," prefix).
   * @param format     Image format, e.g. 'jpeg' or 'png'.
   * @param entries    Watermark entries to render.
   * @returns          Full data-URL with watermarks drawn.
   */
  private applyWatermarks(
    rawBase64: string,
    format: string,
    entries: WatermarkEntry[],
  ): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        // ── Typography setup ─────────────────────────────────────
        // Font size scales with image width: readable on low- and
        // high-resolution captures alike. Minimum 20 px.
        const fontSize   = Math.max(20, Math.round(img.width * 0.035));
        const lineHeight = Math.round(fontSize * 1.5);
        const padding    = Math.round(fontSize * 0.8);

        ctx.font         = `600 ${fontSize}px sans-serif`;
        ctx.textBaseline = 'alphabetic';

        // ── Shadow for contrast on any background ───────────────────
        ctx.shadowColor   = 'rgba(0,0,0,0.75)';
        ctx.shadowBlur    = Math.round(fontSize * 0.4);
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillStyle     = 'rgba(255,255,255,0.92)';

        // ── Group entries by normalised position ─────────────────────
        const groups = new Map<string, string[]>();
        for (const entry of entries) {
          const pos = (entry.position || 'bottom-right').toLowerCase();
          if (!groups.has(pos)) groups.set(pos, []);
          groups.get(pos)!.push(entry.text);
        }

        // ── Draw each position group ───────────────────────────────
        groups.forEach((lines, pos) => {
          const totalLines = lines.length;
          const isTopGroup = pos.startsWith('top') || pos === 'center-top';

          lines.forEach((text, idx) => {
            const textW = ctx.measureText(text).width;

            // X: left / center / right
            let x: number;
            if (pos.includes('left')) {
              x = padding;
            } else if (pos.includes('right')) {
              x = canvas.width - textW - padding;
            } else {
              // top-center or bottom-center
              x = (canvas.width - textW) / 2;
            }

            // Y: stack downward for top groups, upward for bottom groups
            let y: number;
            if (isTopGroup) {
              // First line closest to top edge; subsequent lines move down
              y = padding + fontSize + idx * lineHeight;
            } else {
              // Last line closest to bottom edge; earlier lines move up
              // idx 0 is the topmost in the stack
              y = canvas.height - padding - (totalLines - 1 - idx) * lineHeight;
            }

            ctx.fillText(text, x, y);
          });
        });

        resolve(canvas.toDataURL(`image/${format}`));
      };

      img.onerror = () => {
        // Fallback: return original image unmodified if Canvas fails.
        resolve(`data:image/${format};base64,${rawBase64}`);
      };

      img.src = `data:image/${format};base64,${rawBase64}`;
    });
  }
}
