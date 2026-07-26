import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormioCustomComponent } from 'angular-formio';
import { AuditAreaConfig, AreaAuditResponse, AuditState, DetectionPrediction, Finding, AreaAuditPayload, DetectedObjectResult, AuditPlanItem, AuditObjectEntry, RoomFilterState, RoomRecord } from './ai-room-audit.interfaces';
import { DEFAULT_AUDIT_AREAS, DEFAULT_STANDARDS } from './ai-room-audit-defaults';
import { AiObjectDetectionService } from './ai-object-detection.service';
import { AiCameraAuditService } from './ai-camera-audit.service';
import { AlertService } from '../../../services/alert/alert.service';

const DETECTION_THROTTLE_MS = 400;
const ABSENT_FRAMES_EVICT = 10;

/**
 * Module-level state cache keyed by the component key.
 * Survives component re-creation by angular-formio.
 */
const _componentStateCache = new Map<string, {
  sessionScore: number;
  auditedCount: number;
  sessionStatus: string;
  auditedObjects: DetectedObjectResult[];
  auditSessionId: string;
  auditRunCount: number;
  roomDrivenMode: boolean;
  auditPlan: AuditPlanItem[];
  selectedRoom: RoomRecord | null;
  filters: RoomFilterState;
  rooms: RoomRecord[];
}>();

@Component({
  selector: 'app-ai-room-camera-audit',
  templateUrl: './ai-room-camera-audit.component.html',
  styleUrls: ['./ai-room-camera-audit.component.scss']
})
export class AiRoomCameraAuditComponent implements FormioCustomComponent<any>, OnInit, OnChanges, OnDestroy {
  // ── Formio contract bindings ──────────────────────────────────────────────
  @Input() value: any = null;
  @Output() valueChange = new EventEmitter<any>();
  @Input() disabled: boolean = false;
  @Input() key: string = '';

  // ── Component settings (populated via fieldOptions) ───────────────────────
  @Input() auditEndpoint: string = 'https://dummy-ai-api.dynamico.local/api/room-audit/area';
  @Input() roomsEndpoint: string = '';
  @Input() roomFloorKey: string = 'floor';
  @Input() roomNumberKey: string = 'roomNumber';
  @Input() roomTypeKey: string = 'roomType';
  @Input() roomActiveKey: string = 'isActive';
  @Input() roomAuditObjectsKey: string = 'auditObjects';
  @Input() confidenceThreshold: number = 0.70;
  @Input() stableFramesRequired: number = 4;
  @Input() cooldownSecondsPerArea: number = 30;
  @Input() globalMinSecondsBetweenAuditCalls: number = 3;
  @Input() maxAuditsPerSession: number = 10;
  @Input() autoCapture: boolean = true;
  @Input() showBoundingBoxes: boolean = true;
  @Input() showAuditOverlay: boolean = true;
  @Input() detectableAreas: AuditAreaConfig[] = [];
  @Input() cameraWidth: number = 1280;
  @Input() cameraHeight: number = 720;
  @Input() cameraZoom: number = 1;

  // ── UI element references ──────────────────────────────────────────────────
  @ViewChild('videoElement', { static: false }) videoElementRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasOverlay', { static: false }) canvasOverlayRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoContainer', { static: false }) videoContainerRef!: ElementRef<HTMLDivElement>;

  // ── State variables ────────────────────────────────────────────────────────
  state: AuditState = AuditState.Idle;
  isCameraActive = false;
  isModelLoading = false;
  errorMessage = '';
  statusText = 'Camera ready';
  activeOverlayResult: AreaAuditResponse | null = null;
  previewImageUrl: string | null = null;

  // Detection loop properties
  private animationFrameId: number | null = null;
  private lastDetectionTime = 0;
  private lastAuditTime = 0;

  // Session stats
  auditSessionId = '';
  auditRunCount = 0;
  sessionScore = 100;
  sessionStatus = 'Pass';
  auditedCount = 0;

  // Track dynamic audited objects and visibility states
  auditedObjects: DetectedObjectResult[] = [];
  visibleLabels: Set<string> = new Set<string>();
  stableFrameCounts: Map<string, number> = new Map<string, number>();
  absentFrameCounts: Map<string, number> = new Map<string, number>();
  currentInstanceKeys: Map<string, string> = new Map<string, string>();
  instanceCounters: Map<string, number> = new Map<string, number>();
  highlightedLabel: string | null = null;

  configuredAreas: AuditAreaConfig[] = [];

  // ── Room-driven mode state ─────────────────────────────────────────────────
  roomDrivenMode = false;
  rooms: RoomRecord[] = [];
  roomsLoading = false;
  roomsError = '';
  filters: RoomFilterState = { floor: null, roomType: null, roomNumber: null };
  availableFloors: string[] = [];
  availableRoomTypes: string[] = [];
  availableRoomNumbers: string[] = [];
  selectedRoom: RoomRecord | null = null;
  auditPlan: AuditPlanItem[] = [];
  activePlanItem: AuditPlanItem | null = null;

  constructor(
    private detectionService: AiObjectDetectionService,
    private cameraService: AiCameraAuditService,
    private alertService: AlertService
  ) { }

  // ── Lifecycle hooks ────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.initConfigAndStates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Restore cached state FIRST so rooms/selection survive mat-tab switches.
    // Form.io's attach() delivers key + all fieldOptions in one changeset, and
    // the cache (keyed by `key`) includes the rooms array, so onRoomsEndpointChanged
    // will see rooms.length > 0 and skip a redundant refetch that would wipe state.
    if (changes['key'] && changes['key'].currentValue) {
      this.restoreCachedState();
    }

    // Form.io's createCustomFormioComponent.attach() sets @Input() values AFTER
    // the Angular Element bootstraps, so ngOnInit sees only defaults. React to
    // the room-config inputs here once form.io delivers them.
    if (changes['roomsEndpoint']) {
      this.onRoomsEndpointChanged(changes['roomsEndpoint'].currentValue);
    }
if (changes['roomActiveKey'] && this.roomDrivenMode && this.rooms.length > 0) {
      // Active-flag key changed  the active room set may differ, refetch.
      this.loadRooms();
    } else if ((changes['roomFloorKey'] || changes['roomNumberKey'] || changes['roomTypeKey']) &&
               this.roomDrivenMode && this.selectedRoom) {
      // Metadata keys changed  recompute filter lists and re-resolve selection.
      this.recomputeAvailableFilterLists();
      this.onRoomNumberChange();
    }
    if (changes['roomAuditObjectsKey'] && this.roomDrivenMode && this.selectedRoom) {
      // Objects-array key changed  rebuild the plan from the selected room.
      this.auditPlan = this.buildAuditPlanFromRoom(this.selectedRoom);
      this.auditedObjects = [...this.auditPlan];
      this.recalculateSessionStats();
      this.emitChange();
      this.cacheState();
    }

    if (changes['value'] && changes['value'].currentValue) {
      let val = changes['value'].currentValue;
      
      // 1. Handle JSON string values
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try {
            val = JSON.parse(trimmed);
          } catch (e) {
            console.warn('Failed to parse value string as JSON:', e);
          }
        }
      }

      // 2. Unwrap nested arrays (form.io may wrap the value multiple times)
      while (Array.isArray(val) && val.length === 1 && Array.isArray(val[0])) {
        val = val[0];
      }
      // Unwrap single-element array containing the new-format object
      if (Array.isArray(val) && val.length === 1 && val[0] && typeof val[0] === 'object'
          && !Array.isArray(val[0]) && val[0].auditedObjects) {
        val = val[0];
      }

      // 3. Handle unwrapped single legacy object
      if (val && !Array.isArray(val) && typeof val === 'object' && !val.auditedObjects) {
        if (val.status || val.label || val.areaKey) {
          val = [val];
        }
      }

      // 4a. New format: { auditedObjects: [...], roomSelection: {...} }
      if (val && typeof val === 'object' && !Array.isArray(val) && val.auditedObjects) {
        const arr = Array.isArray(val.auditedObjects) ? val.auditedObjects : [];
        if (arr.length > 0 && this.auditedObjects.length === 0) {
          this.auditedObjects = arr.map((v: any) => this.mapSavedAuditedObject(v));
          this.recalculateSessionStats();
          if (val.roomSelection) {
            this.restoreRoomSelection(val.roomSelection);
          }
          if (this.roomDrivenMode && this.auditPlan.length === 0 && this.auditedObjects.length > 0) {
            this.auditPlan = this.auditedObjects.map(o => this.toAuditPlanItem(o));
          }
        }
      }
      // 4b. Old format: array of audited objects (backward compat for existing records)
      else if (Array.isArray(val) && val.length > 0 && this.auditedObjects.length === 0) {
        this.auditedObjects = val.map((v: any) => this.mapSavedAuditedObject(v));
        this.recalculateSessionStats();
        if (this.roomDrivenMode && this.auditPlan.length === 0 && this.auditedObjects.length > 0) {
          this.auditPlan = this.auditedObjects.map(o => this.toAuditPlanItem(o));
        }
      }
    }
  }

  /**
   * Maps a saved audited-object entry (from form.io value) into the runtime
   * DetectedObjectResult shape, syncing instance counters as a side effect.
   */
  private mapSavedAuditedObject(v: any): DetectedObjectResult {
    const rawLabel = v.label || v.areaKey || '';
    const label = rawLabel.toLowerCase();
    const instanceKey = v.instanceKey || `${label}_${Math.random().toString(36).substr(2, 5)}`;

    const parts = instanceKey.split('_');
    const counter = parts.length > 1 ? parseInt(parts[parts.length - 1], 10) : NaN;
    if (!isNaN(counter)) {
      const currentMax = this.instanceCounters.get(label) || 0;
      if (counter > currentMax) {
        this.instanceCounters.set(label, counter);
      }
    }

    return {
      instanceKey,
      label,
      displayName: v.displayName || `${this.getMatchingArea(label)?.displayName || rawLabel} #${counter || 1}`,
      status: v.status,
      score: v.score || 0,
      message: v.message || '',
      findings: v.findings || [],
      imageFile: v.imageFile || null,
      lastAuditTimestamp: v.lastAuditTimestamp || Date.now()
    };
  }

  /**
   * Promotes a loaded audited object into an AuditPlanItem for chip rendering.
   */
  private toAuditPlanItem(o: DetectedObjectResult): AuditPlanItem {
    const parts = (o.instanceKey || '').split('_');
    const n = parts.length > 1 ? parseInt(parts[parts.length - 1], 10) : NaN;
    return { ...o, instanceIndex: isNaN(n) ? 1 : n };
  }

  /**
   * Restores the room filter selection and a minimal selectedRoom record from
   * saved data so the camera can start immediately on edit-mode reopen. When
   * loadRooms() resolves, refreshRoomCatalog() replaces this with the full record.
   */
  private restoreRoomSelection(saved: any): void {
    if (!saved || !saved.roomNumber) return;
    this.filters = {
      floor: saved.floor || null,
      roomType: saved.roomType || null,
      roomNumber: saved.roomNumber || null
    };
    this.selectedRoom = {
      recordid: saved.recordid,
      recordref: saved.recordref,
      [this.roomFloorKey]: saved.floor,
      [this.roomNumberKey]: saved.roomNumber,
      [this.roomTypeKey]: saved.roomType,
      isActive: true
    } as RoomRecord;
  }

  ngOnDestroy(): void {
    this.stopCamera();
    this.detectionService.dispose();
  }

  // ── Initialization & State Management ──────────────────────────────────────
  private initConfigAndStates(): void {
    // Populate areas from input schema or use defaults
    this.configuredAreas = (this.detectableAreas && this.detectableAreas.length > 0)
      ? this.detectableAreas
      : DEFAULT_AUDIT_AREAS;

    if (this.key) {
      this.restoreCachedState();
    }

    // NOTE: roomDrivenMode + loadRooms() are NOT set up here. form.io delivers
    // the room-config @Input() values via attach() AFTER ngOnInit, so we react
    // to them in ngOnChanges (onRoomsEndpointChanged).
  }

  /**
   * Reacts to the roomsEndpoint input once form.io delivers it (in ngOnChanges).
   * Toggles room-driven mode and kicks off the initial rooms fetch. Idempotent:
   * a duplicate change with the same value will not refetch.
   */
  private onRoomsEndpointChanged(endpoint: string): void {
    const wantRoomMode = !!endpoint;
    if (wantRoomMode === this.roomDrivenMode && this.rooms.length > 0) {
      return; // already in the correct mode and rooms are loaded
    }
    this.roomDrivenMode = wantRoomMode;
    if (wantRoomMode) {
      if (this.rooms.length === 0 && !this.roomsLoading && !this.roomsError) {
        this.loadRooms();
      }
    } else {
      // Switched back to legacy mode → clear room-driven state
      this.resetFiltersAndSelection();
    }
  }

  private restoreCachedState(): void {
    const cached = _componentStateCache.get(this.key);
    const hasIncomingValue = this.value != null
      && !(Array.isArray(this.value) && this.value.length === 0)
      && !(typeof this.value === 'string' && this.value.trim() === '')
      && !(this.value && typeof this.value === 'object' && !Array.isArray(this.value)
           && (!this.value.auditedObjects || this.value.auditedObjects.length === 0)
           && !this.value.roomSelection);
    if (cached && !hasIncomingValue) {
      // New record reusing the same component key — discard stale cache and reset.
      _componentStateCache.delete(this.key);
      this.auditSessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      this.resetFiltersAndSelection();
      this.cacheState();
      return;
    }
    if (cached) {
      this.sessionScore = cached.sessionScore;
      this.auditedCount = cached.auditedCount;
      this.sessionStatus = cached.sessionStatus;
      this.auditedObjects = cached.auditedObjects || [];
      this.auditSessionId = cached.auditSessionId;
      this.auditRunCount = cached.auditRunCount;
      this.roomDrivenMode = cached.roomDrivenMode ?? this.roomDrivenMode;
      this.auditPlan = cached.auditPlan || [];
      this.selectedRoom = cached.selectedRoom || null;
      this.filters = cached.filters || { floor: null, roomType: null, roomNumber: null };
      this.rooms = cached.rooms || [];
      this.syncInstanceCounters();
      if (this.roomDrivenMode && this.rooms.length > 0) {
        this.recomputeAvailableFilterLists();
      }
    } else {
      this.auditSessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
      this.auditedObjects = [];
      this.cacheState();
    }
  }

  private syncInstanceCounters(): void {
    this.instanceCounters.clear();
    this.auditedObjects.forEach(v => {
      const rawLabel = v.label || (v as any).areaKey || '';
      const label = rawLabel.toLowerCase();
      const instanceKey = v.instanceKey || `${label}_${Math.random().toString(36).substr(2, 5)}`;
      const parts = instanceKey.split('_');
      const counter = parts.length > 1 ? parseInt(parts[parts.length - 1], 10) : NaN;
      if (!isNaN(counter)) {
        const currentMax = this.instanceCounters.get(label) || 0;
        if (counter > currentMax) {
          this.instanceCounters.set(label, counter);
        }
      }
    });
  }

  private cacheState(): void {
    if (this.key) {
      _componentStateCache.set(this.key, {
        sessionScore: this.sessionScore,
        auditedCount: this.auditedCount,
        sessionStatus: this.sessionStatus,
        auditedObjects: this.auditedObjects,
        auditSessionId: this.auditSessionId,
        auditRunCount: this.auditRunCount,
        roomDrivenMode: this.roomDrivenMode,
        auditPlan: this.auditPlan,
        selectedRoom: this.selectedRoom,
        filters: this.filters,
        rooms: this.rooms
      });
    }
  }

  // ── Helper to map label to area config ─────────────────────────────────────
  getMatchingArea(label: string): AuditAreaConfig | null {
    if (!label) return null;
    const labelLower = label.toLowerCase();
    
    // Prioritize specific areas over 'room'
    const specificArea = this.configuredAreas.find(area => 
      area.areaKey !== 'room' && area.targetLabels.some(tl => tl.toLowerCase() === labelLower)
    );
    if (specificArea) return specificArea;
    
    // Fallback to room
    return this.configuredAreas.find(area => 
      area.targetLabels.some(tl => tl.toLowerCase() === labelLower)
    ) || null;
  }

  /**
   * In room-driven mode, labels come from the room record and are always valid
   * detection targets even if not present in DEFAULT_AUDIT_AREAS. This returns
   * the matching configured area or a transient fallback so payload building works.
   */
  private getMatchingAreaOrFallback(label: string): AuditAreaConfig {
    const matched = this.getMatchingArea(label);
    if (matched) return matched;
    const labelLower = (label || '').toLowerCase();
    return {
      areaKey: labelLower,
      displayName: this.capitalize(label || labelLower),
      targetLabels: [labelLower],
      captureMode: 'auto',
      outputImageField: '',
      outputResultField: '',
      standards: []
    };
  }

  private capitalize(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  // ── Room-driven: catalog, filters, plan ────────────────────────────────────
  get canStartCamera(): boolean {
    return !this.roomDrivenMode || !!this.selectedRoom;
  }

  async loadRooms(): Promise<void> {
    if (!this.roomsEndpoint) {
      this.roomDrivenMode = false;
      return;
    }
    this.roomsLoading = true;
    this.roomsError = '';
    try {
      const rooms = await this.cameraService.getRoomsList(this.roomsEndpoint);
      this.rooms = Array.isArray(rooms) ? rooms : [];
      this.refreshRoomCatalog();
    } catch (error: any) {
      console.error('Failed to load rooms list:', error);
      this.roomsError = error?.message || 'Failed to load rooms. Tap refresh to retry.';
      this.rooms = [];
      this.refreshRoomCatalog();
    } finally {
      this.roomsLoading = false;
      this.cacheState();
    }
  }

  /**
   * Recomputes filter lists after a rooms catalog refresh and re-resolves the
   * current selection to the fresh record object. Does NOT wipe auditedObjects
   * or session stats — a catalog refresh is not a selection reset.
   */
  private refreshRoomCatalog(): void {
    this.recomputeAvailableFilterLists();
    if (this.filters.roomNumber && this.availableRoomNumbers.includes(this.filters.roomNumber)) {
      this.selectedRoom = this.getActiveRooms().find(r => String(r[this.roomNumberKey]) === this.filters.roomNumber) || null;
    } else {
      this.filters = { floor: null, roomType: null, roomNumber: null };
      this.selectedRoom = null;
      this.activePlanItem = null;
    }
  }

  private resetFiltersAndSelection(): void {
    this.filters = { floor: null, roomType: null, roomNumber: null };
    this.selectedRoom = null;
    this.auditPlan = [];
    this.activePlanItem = null;
    this.auditedObjects = [];
    this.sessionScore = 100;
    this.auditedCount = 0;
    this.sessionStatus = 'Pass';
  }

  private isRoomActive(room: RoomRecord): boolean {
    const val = room?.[this.roomActiveKey];
    return val === true || val === 'True' || val === 'true' || val === 1;
  }

  private getActiveRooms(): RoomRecord[] {
    return this.rooms.filter(r => this.isRoomActive(r));
  }

  private distinctSorted(values: (string | number | null | undefined)[]): string[] {
    const set = new Set<string>();
    values.forEach(v => {
      if (v === null || v === undefined || v === '') return;
      set.add(String(v));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }

  private recomputeAvailableFilterLists(): void {
    const active = this.getActiveRooms();
    const { floor, roomType } = this.filters;

    // Floors: all active rooms (respecting selected type if any)
    const floorSource = active.filter(r => !roomType || String(r[this.roomTypeKey]) === roomType);
    this.availableFloors = this.distinctSorted(floorSource.map(r => r[this.roomFloorKey]));

    // Room types: active rooms on selected floor (if any)
    const typeSource = active.filter(r => !floor || String(r[this.roomFloorKey]) === floor);
    this.availableRoomTypes = this.distinctSorted(typeSource.map(r => r[this.roomTypeKey]));

    // Room numbers: active rooms matching floor + type filters
    const numberSource = active.filter(r =>
      (!floor || String(r[this.roomFloorKey]) === floor) &&
      (!roomType || String(r[this.roomTypeKey]) === roomType)
    );
    this.availableRoomNumbers = this.distinctSorted(numberSource.map(r => r[this.roomNumberKey]));
  }

  onFloorChange(): void {
    // If current type/number no longer valid under new floor, clear them
    if (this.filters.roomType && !this.availableRoomTypes.includes(this.filters.roomType)) {
      this.filters.roomType = null;
    }
    if (this.filters.roomNumber && !this.availableRoomNumbers.includes(this.filters.roomNumber)) {
      this.filters.roomNumber = null;
    }
    this.recomputeAvailableFilterLists();
    this.clearSelectionIfNumberMissing();
  }

  onRoomTypeChange(): void {
    if (this.filters.roomNumber && !this.availableRoomNumbers.includes(this.filters.roomNumber)) {
      this.filters.roomNumber = null;
    }
    this.recomputeAvailableFilterLists();
    this.clearSelectionIfNumberMissing();
  }

  onRoomNumberChange(): void {
    if (!this.filters.roomNumber) {
      this.onRoomSelected(null);
      return;
    }
    const room = this.getActiveRooms().find(r => String(r[this.roomNumberKey]) === this.filters.roomNumber);
    if (room) {
      // Auto-fill floor + type from the chosen room record
      this.filters.floor = String(room[this.roomFloorKey] ?? this.filters.floor);
      this.filters.roomType = String(room[this.roomTypeKey] ?? this.filters.roomType);
      this.recomputeAvailableFilterLists();
      this.onRoomSelected(room);
    } else {
      this.onRoomSelected(null);
    }
  }

  private clearSelectionIfNumberMissing(): void {
    if (this.filters.roomNumber && !this.availableRoomNumbers.includes(this.filters.roomNumber)) {
      this.onRoomSelected(null);
    }
  }

  onRoomSelected(room: RoomRecord | null): void {
    this.selectedRoom = room;
    this.activePlanItem = null;
    if (room) {
      const freshPlan = this.buildAuditPlanFromRoom(room);
      // Inherit saved audit results for matching instances (edit-mode reopen)
      for (const item of freshPlan) {
        const saved = this.auditedObjects.find(o => o.instanceKey === item.instanceKey && o.status !== 'Pending');
        if (saved) {
          item.status = saved.status;
          item.score = saved.score;
          item.message = saved.message;
          item.findings = saved.findings;
          item.imageFile = saved.imageFile;
          item.lastAuditTimestamp = saved.lastAuditTimestamp;
          item.bbox = saved.bbox;
        }
      }
      this.auditPlan = freshPlan;
      this.auditedObjects = [...this.auditPlan];
    } else {
      this.auditPlan = [];
      this.auditedObjects = [];
    }
    this.sessionScore = 100;
    this.auditedCount = 0;
    this.sessionStatus = 'Pass';
    this.recalculateSessionStats();
    this.emitChange();
    this.cacheState();
  }

  /**
   * Reads the configured audit-objects key from the room record, parses it as
   * a stringified JSON array of { cocoLabel, quantity } entries, and builds one
   * AuditPlanItem per required instance. Accepts a JSON string, an already-parsed
   * array, or a single entry object for resilience. Returns [] on parse failure
   * (warns in console) so the UI still renders an empty plan with a hint.
   */
  private buildAuditPlanFromRoom(room: RoomRecord): AuditPlanItem[] {
    const items: AuditPlanItem[] = [];
    if (!room || typeof room !== 'object') return items;

    const raw = room[this.roomAuditObjectsKey];
    if (raw == null || raw === '') return items;

    let entries: AuditObjectEntry[] = [];
    if (typeof raw === 'string') {
      try {
        entries = JSON.parse(raw) as AuditObjectEntry[];
      } catch (e) {
        console.warn(`buildAuditPlanFromRoom: could not parse ${this.roomAuditObjectsKey} as JSON`, e);
        return items;
      }
    } else if (Array.isArray(raw)) {
      entries = raw as AuditObjectEntry[];
    } else if (typeof raw === 'object' && 'cocoLabel' in raw) {
      entries = [raw as AuditObjectEntry];
    }

    for (const entry of entries) {
      const qty = typeof entry.quantity === 'number'
        ? entry.quantity
        : parseInt(entry.quantity as any, 10);
      if (!qty || qty <= 0 || isNaN(qty)) continue;
      const label = String(entry.cocoLabel || '').toLowerCase();
      if (!label) continue;
      const displayNameBase = this.capitalize(entry.cocoLabel || label);
      for (let i = 1; i <= qty; i++) {
        items.push({
          instanceKey: `${label}_${i}`,
          label,
          displayName: `${displayNameBase} ${i}`,
          instanceIndex: i,
          status: 'Pending',
          score: 0,
          message: 'Waiting for audit',
          findings: [],
          imageFile: null as any,
          lastAuditTimestamp: 0
        });
      }
    }
    return items;
  }

  selectPlanItem(item: AuditPlanItem): void {
    if (this.disabled || item.status !== 'Pending') return;
    this.activePlanItem = item;
    // Reset stable-frame tracking for this label so detection starts fresh
    this.stableFrameCounts.set(item.label, 0);
    this.absentFrameCounts.set(item.label, 0);
    if (this.isCameraActive) {
      // Restart the loop so detection immediately focuses the newly selected label
      this.startDetectionLoop();
    }
  }

  hasPendingPlanItems(): boolean {
    return this.auditPlan.some(i => i.status === 'Pending');
  }

  /**
   * Room filters are locked once any plan item has been audited; the user must
   * reset (remove) all audited objects before changing the room. This prevents
   * mixing audit results from one room with another room's plan.
   */
  get roomFiltersLocked(): boolean {
    return this.roomDrivenMode && this.auditPlan.some(i => i.status !== 'Pending');
  }

  trackPlanItem(index: number, item: AuditPlanItem): string {
    return item.instanceKey || `${item.label}-${index}`;
  }

  // ── Camera Operations ──────────────────────────────────────────────────────
  async startCamera(): Promise<void> {
    this.errorMessage = '';
    this.isModelLoading = true;
    this.state = AuditState.CameraStarting;
    this.statusText = 'Initializing camera & AI model...';

    try {
      // 1. Ensure tfjs & coco-ssd are loaded
      await this.detectionService.loadModel();
      this.isModelLoading = false;

      // 2. Play the getUserMedia rear camera stream
      const video = this.videoElementRef.nativeElement;
      await this.cameraService.startCamera(
        video, 
        'environment',
        1280, // High definition default resolution width
        720,  // High definition default resolution height
        this.cameraZoom || 1
      );
      this.isCameraActive = true;
      this.state = AuditState.CameraReady;
      this.statusText = 'Camera Active';

      // 3. Kickoff detection animation loop
      this.startDetectionLoop();
    } catch (error: any) {
      console.error('Start Camera failed:', error);
      this.isCameraActive = false;
      this.isModelLoading = false;
      this.state = AuditState.Error;
      this.errorMessage = error.message || 'Failed to open camera or load AI models. Please verify permissions.';
      this.statusText = 'Camera failed';
    }
  }

  stopCamera(): void {
    this.cancelDetectionLoop();

    if (this.videoElementRef) {
      this.cameraService.stopCamera(this.videoElementRef.nativeElement);
    }

    this.isCameraActive = false;
    this.state = AuditState.Idle;
    this.statusText = 'Camera ready';
    this.clearOverlayCanvas();
  }

  dismissError(): void {
    this.errorMessage = '';
    this.state = AuditState.Idle;
  }

  // ── Bounding Box / Detection Rendering Loop ────────────────────────────────
  private startDetectionLoop(): void {
    this.cancelDetectionLoop();
    this.lastDetectionTime = 0;
    this.state = AuditState.Detecting;
    this.statusText = 'Scanning room...';

    const loop = async (timestamp: number) => {
      if (!this.isCameraActive) return;

      // Run detection every 400ms (balanced performance/UI throttle)
      if (timestamp - this.lastDetectionTime >= DETECTION_THROTTLE_MS) {
        this.lastDetectionTime = timestamp;
        await this.runObjectDetection();
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private cancelDetectionLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private async runObjectDetection(): Promise<void> {
    const video = this.videoElementRef.nativeElement;
    const canvas = this.canvasOverlayRef.nativeElement;

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    try {
      const predictions = await this.detectionService.detect(video);
      this.drawBoundingBoxes(predictions, video, canvas);
      this.processPredictions(predictions);
    } catch (error) {
      console.error('Error in detection cycle:', error);
    }
  }

  private drawBoundingBoxes(
    predictions: DetectionPrediction[],
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas display dimensions to video feed dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!this.showBoundingBoxes) return;

    const validPredictions = predictions.filter(pred => {
      if (pred.confidence < this.confidenceThreshold) return false;
      if (this.roomDrivenMode) {
        // Only the currently selected plan item's label is a valid target
        return !!this.activePlanItem && pred.label.toLowerCase() === this.activePlanItem.label;
      }
      return this.getMatchingArea(pred.label) !== null;
    });

    validPredictions.forEach(pred => {
      const { x, y, width, height } = pred.bbox;
      const labelLower = pred.label.toLowerCase();

      // Determine status/color
      const instKey = this.currentInstanceKeys.get(labelLower);
      const objResult = instKey ? this.auditedObjects.find(o => o.instanceKey === instKey) : null;
      let color = '#3C7F92'; // default teal
      let borderThick = 4;

      if (objResult) {
        if (objResult.status === 'Pending') {
          color = '#f6ad55'; // amber/yellow
        } else if (objResult.status === 'Pass') {
          color = '#27ae60'; // green
        } else if (objResult.status === 'NeedsCorrection' || objResult.status === 'Fail') {
          color = '#e74c3c'; // red
        }
      }

      if (this.highlightedLabel === labelLower) {
        borderThick = 8;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
      } else {
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
      }

      // Drawing styling
      ctx.strokeStyle = color;
      ctx.lineWidth = borderThick;

      // Draw rect
      ctx.strokeRect(x, y, width, height);

      // Label background
      ctx.fillStyle = color;
      const labelText = `${pred.label} (${Math.round(pred.confidence * 100)}%)`;
      ctx.font = 'bold 20px sans-serif';
      const textWidth = ctx.measureText(labelText).width;

      ctx.fillRect(x - 2, y - 34, textWidth + 16, 34);

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillText(labelText, x + 6, y - 10);
    });
  }

  private clearOverlayCanvas(): void {
    if (this.canvasOverlayRef) {
      const canvas = this.canvasOverlayRef.nativeElement;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  // ── Room Audit Logic ───────────────────────────────────────────────────────
  private processPredictions(predictions: DetectionPrediction[]): void {
    if (this.roomDrivenMode) {
      this.processPredictionsRoomDriven(predictions);
      return;
    }
    const validPredictions = predictions.filter(pred => {
      if (pred.confidence < this.confidenceThreshold) return false;
      return this.getMatchingArea(pred.label) !== null;
    });

    const now = Date.now();
    const detectedLabelsInFrame = new Set<string>();

    validPredictions.forEach(pred => {
      const labelLower = pred.label.toLowerCase();
      detectedLabelsInFrame.add(labelLower);

      // Check if it's a new visible label or reset absent count
      if (!this.visibleLabels.has(labelLower)) {
        this.visibleLabels.add(labelLower);
        this.stableFrameCounts.set(labelLower, 0);
      }
      this.absentFrameCounts.set(labelLower, 0);

      // Increment stable frame count
      const currentStableCount = (this.stableFrameCounts.get(labelLower) || 0) + 1;
      this.stableFrameCounts.set(labelLower, currentStableCount);

      // Resolve instance key
      let instKey = this.currentInstanceKeys.get(labelLower);
      if (!instKey) {
        const nextIndex = (this.instanceCounters.get(labelLower) || 0) + 1;
        this.instanceCounters.set(labelLower, nextIndex);
        instKey = `${labelLower}_${nextIndex}`;
        this.currentInstanceKeys.set(labelLower, instKey);
      }

      // Cooldown check
      const objResult = this.auditedObjects.find(o => o.instanceKey === instKey);
      const lastAudit = objResult ? objResult.lastAuditTimestamp : 0;
      const isCooldownActive = (now - lastAudit) < (this.cooldownSecondsPerArea * 1000);

      if (currentStableCount >= this.stableFramesRequired &&
          !isCooldownActive &&
          (!objResult || objResult.status !== 'Pending') &&
          this.autoCapture &&
          this.auditedObjects.filter(o => o.status !== 'Pending').length < this.maxAuditsPerSession) {
        
        // Global throttle
        if (now - this.lastAuditTime >= (this.globalMinSecondsBetweenAuditCalls * 1000)) {
          const area = this.getMatchingArea(pred.label)!;
          this.triggerAutoCapture(labelLower, pred, area, instKey);
        }
      }
    });

    // Handle absent labels
    this.visibleLabels.forEach(label => {
      if (!detectedLabelsInFrame.has(label)) {
        const absentCount = (this.absentFrameCounts.get(label) || 0) + 1;
        this.absentFrameCounts.set(label, absentCount);

        if (absentCount > ABSENT_FRAMES_EVICT) { // ~4 seconds of absence at 400ms interval
          this.visibleLabels.delete(label);
          this.stableFrameCounts.set(label, 0);
          this.currentInstanceKeys.delete(label); // Reset instance key to trigger a new instance next time it enters
        }
      }
    });
  }

  /**
   * Room-driven detection processing: only the active plan item's label matters.
   * No instance-key invention (plan is fixed), no cooldown, no max-session gate.
   */
  private processPredictionsRoomDriven(predictions: DetectionPrediction[]): void {
    if (!this.activePlanItem) return;
    const targetLabel = this.activePlanItem.label;
    const instKey = this.activePlanItem.instanceKey || `${targetLabel}_${this.activePlanItem.instanceIndex}`;

    const pred = predictions.find(p => p.label.toLowerCase() === targetLabel && p.confidence >= this.confidenceThreshold);
    if (!pred) {
      // Reset stable count when the target leaves the frame
      this.stableFrameCounts.set(targetLabel, 0);
      return;
    }

    const now = Date.now();
    const currentStableCount = (this.stableFrameCounts.get(targetLabel) || 0) + 1;
    this.stableFrameCounts.set(targetLabel, currentStableCount);

    if (currentStableCount >= this.stableFramesRequired &&
        this.activePlanItem.status === 'Pending' &&
        this.autoCapture &&
        (now - this.lastAuditTime >= (this.globalMinSecondsBetweenAuditCalls * 1000))) {
      const area = this.getMatchingAreaOrFallback(pred.label);
      this.triggerAutoCapture(targetLabel, pred, area, instKey, this.activePlanItem);
    }
  }

  private async triggerAutoCapture(
    label: string,
    pred: DetectionPrediction,
    area: AuditAreaConfig,
    instKey: string,
    planItem?: AuditPlanItem
  ): Promise<void> {
    this.cancelDetectionLoop(); // Pause loop during capture/send

    const indexStr = instKey.split('_')[1];
    const instNum = indexStr ? parseInt(indexStr, 10) : 1;
    const displayName = planItem ? planItem.displayName : `${area.displayName} #${instNum}`;

    // Create or update entry in auditedObjects
    let objResult = this.auditedObjects.find(o => o.instanceKey === instKey);
    if (!objResult) {
      objResult = {
        instanceKey: instKey,
        label,
        displayName,
        status: 'Pending',
        score: 0,
        message: 'Auditing...',
        findings: [],
        imageFile: null as any,
        lastAuditTimestamp: Date.now(),
        bbox: pred.bbox
      };
      this.auditedObjects.push(objResult);
    } else {
      objResult.status = 'Pending';
      objResult.message = 'Auditing...';
      objResult.bbox = pred.bbox;
    }
    if (planItem) {
      planItem.status = 'Pending';
      planItem.message = 'Auditing...';
      planItem.bbox = pred.bbox;
    }
    
    this.state = AuditState.Capturing;
    this.statusText = `Capturing ${displayName} image...`;
    this.emitChange();

    try {
      // 1. Capture base64 frame from stream
      const rawUri = this.cameraService.captureFrame(this.videoElementRef.nativeElement);

      // 2. Resize frame
      this.statusText = `Sending ${displayName} audit...`;
      this.state = AuditState.SendingToAudit;
      const resizedUri = await this.cameraService.resizeImage(rawUri);

      // 3. Build endpoint payload
      this.auditRunCount++;
      const payload = this.buildPayloadForLabel(label, pred, area, resizedUri, displayName);

      // 4. Send HTTP request
      this.lastAuditTime = Date.now();
      const response = await this.cameraService.sendAreaAudit(this.auditEndpoint, payload);

      // 5. Update state & form data
      this.handleAuditResponseForLabel(label, area, response, resizedUri, pred.bbox, instKey, planItem);

      if (this.roomDrivenMode) {
        // Room mode: do NOT auto-advance. Clear active chip so the user picks the next one.
        this.activePlanItem = null;
        this.stableFrameCounts.set(label, 0);
      } else {
        // Legacy: clear current instance so next detection of the same label creates a NEW instance
        this.currentInstanceKeys.delete(label);
        this.stableFrameCounts.set(label, 0);
        this.visibleLabels.delete(label);
      }
    } catch (error) {
      console.error(`Auto audit failed for ${displayName}:`, error);
      objResult.status = 'Fail';
      objResult.message = `Audit failed for ${displayName}.`;
      if (planItem) {
        planItem.status = 'Fail';
        planItem.message = `Audit failed for ${displayName}.`;
      }
      this.state = AuditState.Error;
      this.errorMessage = `Audit failed for ${displayName}.`;
    } finally {
      this.cacheState();
      // Resume scanning loop
      if (this.isCameraActive) {
        this.startDetectionLoop();
      }
    }
  }

  // ── FormIO Integration & Field Mapping ─────────────────────────────────────
  private buildPayloadForLabel(label: string, pred: DetectionPrediction, area: AuditAreaConfig, imgUri: string, displayName: string): AreaAuditPayload {
    // Map standard codes to standard full structures
    const areaStandards = area.standards.map(code => {
      const std = DEFAULT_STANDARDS[code];
      return std ? std : { code, area: area.displayName, title: code, expected: '', weight: 10 };
    });

    // Room metadata: prefer the selected room record (room-driven mode), fall back to sibling form fields
    const room = this.selectedRoom;
    const roomInfo = {
      hotel: this.getFormValue('hotel') || '',
      branch: this.getFormValue('branch') || '',
      floor: room ? String(room[this.roomFloorKey] ?? '') : (this.getFormValue('floor') || ''),
      roomNumber: room ? String(room[this.roomNumberKey] ?? '') : (this.getFormValue('roomNumber') || ''),
      roomType: room ? String(room[this.roomTypeKey] ?? '') : (this.getFormValue('roomType') || ''),
      auditorName: this.getFormValue('auditorName') || '',
      roomRecordId: room?.recordid,
      roomRecordRef: room?.recordref
    };

    return {
      auditSessionId: this.auditSessionId,
      auditRunId: `run_${this.auditSessionId}_${this.auditRunCount}`,
      areaKey: label, // Use specific detected label
      areaDisplayName: displayName,
      detectedObjects: [{
        label: pred.label,
        confidence: pred.confidence,
        bbox: pred.bbox
      }],
      roomInfo,
      image: {
        contentType: 'image/jpeg',
        dataUri: imgUri
      },
      standards: areaStandards,
      lang: localStorage.getItem('lang') || 'en'
    };
  }

  private handleAuditResponseForLabel(
    label: string,
    area: AuditAreaConfig,
    response: AreaAuditResponse,
    imageUri: string,
    bbox: any,
    instKey: string,
    planItem?: AuditPlanItem
  ): void {
    const finalImageUri = response.responseImageUri || imageUri;
    const isDataUri = finalImageUri.startsWith('data:');
    const base64Strip = isDataUri ? (finalImageUri.split(',')[1] || '') : '';
    const byteLength = isDataUri ? Math.round((base64Strip.length * 3) / 4) : 0;
    const fileObj = {
      name: `ai_${instKey}_${Date.now()}.jpg`,
      originalName: `${instKey}_capture.jpg`,
      size: byteLength,
      type: 'image/jpeg',
      url: finalImageUri,
      storage: isDataUri ? 'base64' : 'url'
    };

    const indexStr = instKey.split('_')[1];
    const instNum = indexStr ? parseInt(indexStr, 10) : 1;
    const displayName = planItem ? planItem.displayName : `${area.displayName} #${instNum}`;

    let objResult = this.auditedObjects.find(o => o.instanceKey === instKey);
    if (!objResult) {
      objResult = {
        instanceKey: instKey,
        label,
        displayName,
        status: response.status as any,
        score: response.score,
        message: response.message,
        findings: response.findings || [],
        imageFile: fileObj,
        lastAuditTimestamp: Date.now(),
        bbox
      };
      this.auditedObjects.push(objResult);
    } else {
      objResult.status = response.status as any;
      objResult.score = response.score;
      objResult.message = response.message;
      objResult.findings = response.findings || [];
      objResult.imageFile = fileObj;
      objResult.lastAuditTimestamp = Date.now();
      objResult.bbox = bbox;
    }
    // Keep the plan item in sync with the audited object (room-driven mode)
    if (planItem) {
      planItem.status = response.status as any;
      planItem.score = response.score;
      planItem.message = response.message;
      planItem.findings = response.findings || [];
      planItem.imageFile = fileObj;
      planItem.lastAuditTimestamp = Date.now();
      planItem.bbox = bbox;
    }

    this.state = AuditState.AuditCompleted;
    this.statusText = `${displayName} audit completed: ${response.status}`;

    if (this.showAuditOverlay) {
      this.activeOverlayResult = response;
      this.activeOverlayResult.areaDisplayName = displayName;
    }

    // Backwards-compatibility per-area field mapping only applies in legacy mode
    // (room-driven mode has no per-area output fields configured)
    if (!this.roomDrivenMode) {
      if (area.outputImageField) {
        this.setFormValue(area.outputImageField, [fileObj]);
      }
      if (area.outputResultField) {
        this.setFormValue(area.outputResultField, response);
      }
    }

    // 2. Update global `aiCameraAuditResults` field
    this.updateGlobalAuditResultsArray(instKey, response, fileObj);

    // 3. Recalculate summary stats
    this.recalculateSessionStats();

    // 4. Emit change (this.value = auditedObjects)
    this.emitChange();
  }

  private updateGlobalAuditResultsArray(instKey: string, response: AreaAuditResponse, fileObj: any): void {
    let currentResults = this.getFormValue('aiCameraAuditResults');
    if (!Array.isArray(currentResults)) {
      currentResults = [];
    }

    const label = instKey.split('_')[0];
    const indexStr = instKey.split('_')[1];
    const instNum = indexStr ? parseInt(indexStr, 10) : 1;
    const displayName = `${this.getMatchingArea(label)?.displayName || label} #${instNum}`;

    const newItem = {
      instanceKey: instKey,
      areaKey: label,
      displayName,
      status: response.status,
      score: response.score,
      message: response.message,
      findings: response.findings,
      imageFile: fileObj,
      timestamp: new Date().toISOString()
    };

    const index = currentResults.findIndex((item: any) => item.instanceKey === instKey);
    if (index > -1) {
      currentResults[index] = newItem;
    } else {
      currentResults.push(newItem);
    }

    this.setFormValue('aiCameraAuditResults', currentResults);
  }

  openImagePreview(url: string | undefined): void {
    if (url) {
      this.previewImageUrl = url;
    }
  }

  closeImagePreview(): void {
    this.previewImageUrl = null;
  }

  removeAuditedObject(instanceKey: string | undefined): void {
    if (!instanceKey || this.disabled) return;

    const confirmMsg = this.alertService.getTranslation('Are_you_sure_you_want_delete') || 'Are you sure you want to delete?';
    this.alertService.confirmDelete(confirmMsg).then((result) => {
      if (!result.isConfirmed) return;
      if (this.roomDrivenMode) {
        this.resetPlanItemForReaudit(instanceKey);
      } else {
        this.executeRemoveAuditedObject(instanceKey);
      }
    });
  }

  /**
   * Room-driven mode: "removing" an audited item resets its chip back to Pending
   * so the user can re-detect and re-audit it. The plan item is preserved.
   */
  private resetPlanItemForReaudit(instanceKey: string): void {
    const item = this.auditPlan.find(i => i.instanceKey === instanceKey);
    if (!item) return;
    item.status = 'Pending';
    item.score = 0;
    item.message = 'Waiting for audit';
    item.findings = [];
    item.imageFile = null as any;
    item.lastAuditTimestamp = 0;
    item.bbox = undefined;

    const obj = this.auditedObjects.find(o => o.instanceKey === instanceKey);
    if (obj) {
      obj.status = 'Pending';
      obj.score = 0;
      obj.message = 'Waiting for audit';
      obj.findings = [];
      obj.imageFile = null as any;
      obj.lastAuditTimestamp = 0;
      obj.bbox = undefined;
    }

    if (this.activePlanItem === item) {
      this.activePlanItem = null;
    }

    let currentResults = this.getFormValue('aiCameraAuditResults');
    if (Array.isArray(currentResults)) {
      currentResults = currentResults.filter((r: any) => r.instanceKey !== instanceKey);
      this.setFormValue('aiCameraAuditResults', currentResults);
    }

    this.recalculateSessionStats();
    this.cacheState();
    this.emitChange();
  }

  private executeRemoveAuditedObject(instanceKey: string): void {
    this.auditedObjects = this.auditedObjects.filter(o => o.instanceKey !== instanceKey);

    // Also remove from global `aiCameraAuditResults`
    let currentResults = this.getFormValue('aiCameraAuditResults');
    if (Array.isArray(currentResults)) {
      currentResults = currentResults.filter((item: any) => item.instanceKey !== instanceKey);
      this.setFormValue('aiCameraAuditResults', currentResults);
    }

    this.recalculateSessionStats();
    this.cacheState();
    this.emitChange();
  }

  private recalculateSessionStats(): void {
    let totalScore = 0;
    let count = 0;
    let hasFail = false;
    let hasCorrection = false;

    this.auditedObjects.forEach(obj => {
      if (obj.status !== 'Pending') {
        totalScore += obj.score || 0;
        count++;
        if (obj.status === 'Fail') hasFail = true;
        if (obj.status === 'NeedsCorrection') hasCorrection = true;
      }
    });

    this.auditedCount = count;
    this.sessionScore = count > 0 ? Math.round(totalScore / count) : 100;

    if (hasFail) {
      this.sessionStatus = 'Fail';
    } else if (hasCorrection) {
      this.sessionStatus = 'NeedsCorrection';
    } else if (this.roomDrivenMode) {
      // Pass only when every plan item has been audited
      this.sessionStatus = (this.auditPlan.length > 0 && count >= this.auditPlan.length) ? 'Pass' : 'Idle';
    } else {
      this.sessionStatus = count > 0 ? 'Pass' : 'Idle';
    }

    // Save summary indicators to form submission safely
    this.setFormValue('auditStatus', this.sessionStatus);
    this.setFormValue('auditScore', this.sessionScore);

    // Generate simple AI summary text
    const summaryText = `AI audit completed for ${this.auditedCount} objects. Score: ${this.sessionScore}. Status: ${this.sessionStatus}.`;
    this.setFormValue('aiSummary', summaryText);

    // Save raw response tracking
    const rawRecord: Record<string, any> = {};
    this.auditedObjects.forEach(obj => {
      if (obj.status !== 'Pending') {
        rawRecord[obj.instanceKey || obj.label] = {
          score: obj.score,
          status: obj.status,
          message: obj.message,
          findings: obj.findings
        };
      }
    });
    this.setFormValue('aiRawResponse', rawRecord);
  }

  private emitChange(): void {
    // Emit both the audited objects and the room selection so the saved record
    // can restore the room filters + enable the camera on edit-mode reopen.
    const auditedObjects = this.auditedObjects.map(obj => ({
      instanceKey: obj.instanceKey,
      label: obj.label,
      displayName: obj.displayName,
      status: obj.status,
      score: obj.score,
      message: obj.message,
      imageFile: obj.imageFile,
      lastAuditTimestamp: obj.lastAuditTimestamp
    }));

    const roomSelection = this.selectedRoom ? {
      floor: String(this.selectedRoom[this.roomFloorKey] ?? ''),
      roomNumber: String(this.selectedRoom[this.roomNumberKey] ?? ''),
      roomType: String(this.selectedRoom[this.roomTypeKey] ?? ''),
      recordid: this.selectedRoom.recordid,
      recordref: this.selectedRoom.recordref
    } : null;

    this.value = { auditedObjects, roomSelection };
    this.valueChange.emit(this.value);
  }

  // ── FormIO DOM Tree Traversing Helpers ─────────────────────────────────────
  private getRootFormioInstance(): any {
    const formEl = document.querySelector('.formio-form');
    return (formEl as any)?.formio || null;
  }

  getFormValue(key: string): any {
    const formio = this.getRootFormioInstance();
    if (formio) {
      const comp = formio.getComponent(key);
      return comp ? comp.getValue() : formio.submission?.data?.[key];
    }
    return null;
  }

  setFormValue(key: string, val: any): void {
    const formio = this.getRootFormioInstance();
    if (formio) {
      const comp = formio.getComponent(key);
      if (comp) {
        comp.setValue(val);
      } else if (formio.submission && formio.submission.data) {
        formio.submission.data[key] = val;
      }
    }
  }

  appendToFormArray(key: string, item: any): void {
    const formio = this.getRootFormioInstance();
    if (formio) {
      const comp = formio.getComponent(key);
      let current = comp ? comp.getValue() : formio.submission?.data?.[key];
      if (!Array.isArray(current)) {
        current = current ? [current] : [];
      }
      current.push(item);
      if (comp) {
        comp.setValue(current);
      } else if (formio.submission && formio.submission.data) {
        formio.submission.data[key] = current;
      }
    }
  }

  getRootFormioComponent(key: string): any {
    const formio = this.getRootFormioInstance();
    return formio ? formio.getComponent(key) : null;
  }

  // ── Template Template Helpers ──────────────────────────────────────────────
  get statusClass(): string {
    return this.state;
  }

  hasAuditedObjects(): boolean {
    return this.auditedCount > 0;
  }

  getSessionScore(): number {
    return this.sessionScore;
  }

  getAuditedCount(): number {
    return this.auditedCount;
  }

  getSessionStatus(): string {
    return this.sessionStatus;
  }

  clearActiveOverlay(): void {
    this.activeOverlayResult = null;
  }

  highlightObject(label: string): void {
    this.highlightedLabel = label.toLowerCase();
  }

  unhighlightObject(): void {
    this.highlightedLabel = null;
  }
}
