export enum AuditState {
  Idle = 'Idle',
  CameraStarting = 'CameraStarting',
  CameraReady = 'CameraReady',
  Detecting = 'Detecting',
  CandidateDetected = 'CandidateDetected',
  StableTargetConfirmed = 'StableTargetConfirmed',
  Capturing = 'Capturing',
  SendingToAudit = 'SendingToAudit',
  AuditCompleted = 'AuditCompleted',
  Cooldown = 'Cooldown',
  Error = 'Error'
}

export interface RoomAuditStandard {
  code: string;
  area: string;
  title: string;
  expected: string;
  weight: number;
}

export interface AuditAreaConfig {
  areaKey: string;
  displayName: string;
  targetLabels: string[];
  captureMode?: 'auto' | 'manual';
  outputImageField: string;
  outputResultField: string;
  standards: string[];
}

export interface DetectionPrediction {
  label: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface RoomInfo {
  hotel?: string;
  branch?: string;
  floor?: string;
  roomNumber?: string;
  roomType?: string;
  auditorName?: string;
  roomRecordId?: number;
  roomRecordRef?: string;
}

export interface RoomRecord {
  recordid?: number;
  recordref?: string;
  RecordTagValues?: any[];
  RecordTagJson?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface RoomFilterState {
  floor: string | null;
  roomType: string | null;
  roomNumber: string | null;
}

export interface AuditObjectEntry {
  cocoLabel: string;
  quantity: number;
}

export interface AuditPlanItem extends DetectedObjectResult {
  instanceIndex: number;
}

export interface AreaAuditPayload {
  auditSessionId: string;
  auditRunId: string;
  areaKey: string;
  areaDisplayName: string;
  detectedObjects: Array<{
    label: string;
    confidence: number;
    bbox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  roomInfo: RoomInfo;
  image: {
    contentType: string;
    dataUri: string;
  };
  standards: RoomAuditStandard[];
  lang?: string;
}

export interface Finding {
  code: string;
  status: 'Pass' | 'NeedsCorrection' | 'Fail' | 'Partial';
  evidence: string;
  recommendation: string;
}

export interface AreaAuditResponse {
  areaKey: string;
  areaDisplayName?: string;
  status: 'Pass' | 'NeedsCorrection' | 'Fail';
  score: number;
  message: string;
  findings: Finding[];
  needsHumanReview?: boolean;
  humanReviewReason?: string;
  responseImageUri?: string;
}

export interface AreaAuditState {
  areaKey: string;
  stableFrameCount: number;
  lastAuditTimestamp: number;
  status: 'Idle' | 'Pending' | 'Pass' | 'NeedsCorrection' | 'Fail';
  score?: number;
  message?: string;
  findings?: Finding[];
  imageUri?: string;
}

export interface DetectedObjectResult {
  instanceKey?: string;
  label: string;
  displayName: string;
  status: 'Pending' | 'Pass' | 'NeedsCorrection' | 'Fail';
  score: number;
  message: string;
  findings: Finding[];
  imageFile: {
    name: string;
    originalName: string;
    size: number;
    type: string;
    url: string;
    storage: string;
  };
  lastAuditTimestamp: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AiRoomCameraAuditConfig {
  type: string;
  key: string;
  label: string;
  auditEndpoint: string;
  roomsEndpoint?: string;
  roomFloorKey?: string;
  roomNumberKey?: string;
  roomTypeKey?: string;
  roomActiveKey?: string;
  roomAuditObjectsKey?: string;
  confidenceThreshold?: number;
  stableFramesRequired?: number;
  cooldownSecondsPerArea?: number;
  globalMinSecondsBetweenAuditCalls?: number;
  maxAuditsPerSession?: number;
  autoCapture?: boolean;
  showBoundingBoxes?: boolean;
  showAuditOverlay?: boolean;
  detectableAreas?: AuditAreaConfig[];
  cameraWidth?: number;
  cameraHeight?: number;
  cameraZoom?: number;
}
