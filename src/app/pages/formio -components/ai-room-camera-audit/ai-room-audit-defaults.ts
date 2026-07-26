import { AuditAreaConfig, RoomAuditStandard } from './ai-room-audit.interfaces';

export const DEFAULT_STANDARDS: Record<string, RoomAuditStandard> = {
  BED_SHEET_CLEAN: {
    code: 'BED_SHEET_CLEAN',
    area: 'Bed',
    title: 'Bed sheet cleanliness',
    expected: 'Bed sheet must be visibly clean with no stains, hair, dust, dirt, or used marks.',
    weight: 15
  },
  BED_SHEET_ALIGNMENT: {
    code: 'BED_SHEET_ALIGNMENT',
    area: 'Bed',
    title: 'Bed sheet alignment',
    expected: 'Bed sheet must be properly aligned, tucked in neatly, and free of significant wrinkles.',
    weight: 10
  },
  PILLOW_ARRANGEMENT: {
    code: 'PILLOW_ARRANGEMENT',
    area: 'Bed',
    title: 'Pillow arrangement',
    expected: 'Pillows must be fluffed, aligned symmetrically, and placed neatly at the head of the bed.',
    weight: 10
  },
  BATHROOM_CLEANLINESS: {
    code: 'BATHROOM_CLEANLINESS',
    area: 'Bathroom',
    title: 'Bathroom cleanliness',
    expected: 'Toilet, sink, mirrors, and floor must be sparkling clean with no water spots, hair, or grime.',
    weight: 20
  },
  TOWELS_AMENITIES: {
    code: 'TOWELS_AMENITIES',
    area: 'Bathroom',
    title: 'Towels & amenities',
    expected: 'Fresh towels must be folded neatly and placed in designated holders. Amenities must be complete and tidy.',
    weight: 10
  },
  DESK_MINIBAR_AREA: {
    code: 'DESK_MINIBAR_AREA',
    area: 'Desk & Minibar',
    title: 'Desk & minibar cleanliness and setup',
    expected: 'Desk surface must be dust-free. Chairs aligned. Minibar stocked neatly and items upright.',
    weight: 15
  },
  ROOM_GENERAL_ARRANGEMENT: {
    code: 'ROOM_GENERAL_ARRANGEMENT',
    area: 'Room',
    title: 'General room arrangement',
    expected: 'All furniture must be correctly positioned. Curtains hung properly. Trash cans empty and clean.',
    weight: 10
  },
  FLOOR_CLEANLINESS: {
    code: 'FLOOR_CLEANLINESS',
    area: 'Floor',
    title: 'Floor cleanliness',
    expected: 'Floors must be vacuumed (carpets) or mopped (tiles/wood) with no visible trash, hair, or stains.',
    weight: 10
  }
};

export const DEFAULT_AUDIT_AREAS: AuditAreaConfig[] = [
  {
    areaKey: 'bed',
    displayName: 'Bed',
    targetLabels: ['bed'],
    captureMode: 'auto',
    outputImageField: 'bedImage',
    outputResultField: 'bedAuditResult',
    standards: ['BED_SHEET_CLEAN', 'BED_SHEET_ALIGNMENT', 'PILLOW_ARRANGEMENT']
  },
  {
    areaKey: 'bathroom',
    displayName: 'Bathroom',
    targetLabels: ['toilet', 'sink'],
    captureMode: 'auto',
    outputImageField: 'bathroomImage',
    outputResultField: 'bathroomAuditResult',
    standards: ['BATHROOM_CLEANLINESS', 'TOWELS_AMENITIES']
  },
  {
    areaKey: 'desk_minibar',
    displayName: 'Desk & Minibar',
    targetLabels: ['dining table', 'chair', 'refrigerator', 'bottle'],
    captureMode: 'auto',
    outputImageField: 'deskMinibarImage',
    outputResultField: 'deskMinibarAuditResult',
    standards: ['DESK_MINIBAR_AREA']
  },
  {
    areaKey: 'room',
    displayName: 'General Room',
    targetLabels: ['bed', 'chair', 'couch', 'tv'],
    captureMode: 'auto',
    outputImageField: 'fullRoomImage',
    outputResultField: 'roomAuditResult',
    standards: ['ROOM_GENERAL_ARRANGEMENT', 'FLOOR_CLEANLINESS']
  },
  {
    areaKey: 'floor',
    displayName: 'Floor',
    targetLabels: [],
    captureMode: 'manual',
    outputImageField: 'floorImage',
    outputResultField: 'floorAuditResult',
    standards: ['FLOOR_CLEANLINESS']
  }
];
