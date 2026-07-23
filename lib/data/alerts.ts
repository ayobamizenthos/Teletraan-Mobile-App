// Alert and incident data. Alerts (small set) feed the search screen;
// incidents are the longer list shown on the main Alerts dashboard.
// PriorityAlert is what the Alert Priority View renders (landing + detail).

export type SeverityLevel = 'High Level' | 'Low Level' | 'Moderate'

// Each card on the Alert Priority landing + the data backing its detail page.
// `thumbnail` is the still from the camera at the moment of the incident.
export interface PriorityAlert {
  id: string
  level: 'Low Level' | 'High Level'
  activity: string
  suspiciousActivity: string
  location: string
  camera: string
  cameraScreenName: string
  time: string
  threatScorePct: number
  thumbnail: number
}

export interface Alert {
  id: string
  severity: SeverityLevel
  title: string
  camera: string
  location: string
  time: string
  banner: number
}

export interface Incident {
  id: string
  // Foreign key into CAMERA_FEEDS — links each incident to the camera it was
  // detected on, so the camera-detail "Alert History" can filter to its own
  // incidents instead of repeating the same hardcoded list everywhere.
  cameraId: string
  cameraName: string
  severityLevel: SeverityLevel
  alertTitle: string
  suspiciousActivity: string
  location: string
  timestamp: string
  thumbnail: number
  // 0–100. Drives both the detail-page threat slider and the colour band of
  // the severity badge so the list grid and the detail screen agree.
  threatScorePct: number
}

export const SEVERITY_SCORE: Record<SeverityLevel, number> = {
  'High Level': 75,
  Moderate: 50,
  'Low Level': 25,
}

// Single source of truth for severity colours. Both the alerts list grid and
// the incident-detail badge read from here so the colour shown on the card
// always matches the colour shown inside the alert detail.
//   High Level → red (matches the threat slider's high-end stop)
//   Moderate   → amber (matches the slider's mid-stop)
//   Low Level  → green (matches the slider's low-end stop)
export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  'High Level': '#F04438',
  Moderate: '#F79009',
  'Low Level': '#12B76A',
}

export const ALERTS: Alert[] = [
  {
    id: 'a1',
    severity: 'High Level',
    title: 'Forced Entry Detected',
    camera: 'server room',
    location: 'Server room',
    time: '1:42 AM, 07-19-25',
    banner: require('../../assets/media/search-alert-banner.png'),
  },
]

// Priority alerts shown in the red-banner Alert Priority View. Names and copy
// come straight from the Figma frames — every screen should agree on these.
export const PRIORITY_ALERTS: PriorityAlert[] = [
  {
    id: 'p1',
    level: 'Low Level',
    activity: 'Unwanted Object Detected',
    suspiciousActivity: 'Forced Entry Behaviour',
    location: 'Server Room Corridor',
    camera: 'Head Room',
    cameraScreenName: 'Server Room Camera',
    time: '2:54pm',
    threatScorePct: 45,
    thumbnail: require('../../assets/media/alert-card-1.png'),
  },
  {
    id: 'p2',
    level: 'High Level',
    activity: 'Unrecognised Face Detected',
    suspiciousActivity: 'Loitering Behaviour',
    location: 'Server Room Corridor',
    camera: 'Corridor Cam',
    cameraScreenName: 'Server Room Camera',
    time: '3:11pm',
    threatScorePct: 78,
    thumbnail: require('../../assets/media/alert-card-2.png'),
  },
  {
    id: 'p3',
    level: 'High Level',
    activity: 'Unrecognised Face Detected',
    suspiciousActivity: 'Repeated Access Attempts',
    location: 'Server Room Corridor',
    camera: 'East Wing Cam',
    cameraScreenName: 'Server Room Camera',
    time: '3:42pm',
    threatScorePct: 82,
    thumbnail: require('../../assets/media/alert-card-3.png'),
  },
]

export const INCIDENTS: Incident[] = [
  {
    id: '1',
    cameraId: 'car-park-1',
    cameraName: 'Car Park Cam',
    severityLevel: 'High Level',
    alertTitle: 'Forced Entry Detected',
    suspiciousActivity: 'Driver forced rear gate at the visitor ramp',
    location: 'Parking Lot A',
    timestamp: '1:42 AM, 07-19-25',
    threatScorePct: 78,
    thumbnail: require('../../assets/images/cam_feed_1.png'),
  },
  {
    id: '2',
    cameraId: 'car-park-2',
    cameraName: 'Car Park Cam',
    severityLevel: 'Low Level',
    alertTitle: 'Unrecognized Vehicle Detected',
    suspiciousActivity: 'Unknown plate on the loading dock ramp',
    location: 'Loading Dock',
    timestamp: '11:45pm, 08-06-25',
    threatScorePct: 28,
    thumbnail: require('../../assets/images/cam_feed_4.png'),
  },
  {
    id: '3',
    cameraId: 'lodge',
    cameraName: 'Lodge Cam',
    severityLevel: 'Moderate',
    alertTitle: 'Perimeter Breach Detected',
    suspiciousActivity: 'Fence-line motion outside business hours',
    location: 'Main Entrance',
    timestamp: '3:33am, 08-15-25',
    threatScorePct: 52,
    thumbnail: require('../../assets/images/cam_feed_3.png'),
  },
  {
    id: '4',
    cameraId: 'reception',
    cameraName: 'Reception Cam',
    severityLevel: 'High Level',
    alertTitle: 'Unknown Face Detected',
    suspiciousActivity: 'Visitor tailgated through reception',
    location: 'Reception',
    timestamp: '6:17pm, 08-22-25',
    threatScorePct: 84,
    thumbnail: require('../../assets/images/cam_feed_2.png'),
  },
  {
    id: '5',
    cameraId: 'car-park-1',
    cameraName: 'Car Park Cam',
    severityLevel: 'Moderate',
    alertTitle: 'Repeated Loitering Detected',
    suspiciousActivity: 'Same individual returned three times after closing',
    location: 'Parking Lot A',
    timestamp: '9:08pm, 09-02-25',
    threatScorePct: 58,
    thumbnail: require('../../assets/images/cam_feed_3.png'),
  },
  {
    id: '6',
    cameraId: 'gate',
    cameraName: 'Gate Cam',
    severityLevel: 'Low Level',
    alertTitle: 'Object Detected',
    suspiciousActivity: 'Package left unattended near the entry barrier',
    location: 'Main Entrance',
    timestamp: '7:21am, 09-05-25',
    threatScorePct: 24,
    thumbnail: require('../../assets/images/cam_feed_2.png'),
  },
  {
    id: '7',
    cameraId: 'staff-room-cam',
    cameraName: 'Staff room cam',
    severityLevel: 'Moderate',
    alertTitle: 'After-hours Access',
    suspiciousActivity: 'Badge swipe outside scheduled shift window',
    location: 'Office-2 Lobby',
    timestamp: '2:14am, 09-08-25',
    threatScorePct: 47,
    thumbnail: require('../../assets/images/cam_feed_1.png'),
  },
  {
    id: '8',
    cameraId: 'cafe',
    cameraName: 'Cafe',
    severityLevel: 'Low Level',
    alertTitle: 'Motion Detected',
    suspiciousActivity: 'Movement in cafeteria during shut-down window',
    location: 'Cafeteria',
    timestamp: '4:47am, 09-11-25',
    threatScorePct: 19,
    thumbnail: require('../../assets/images/cam_feed_1.png'),
  },
  {
    id: '9',
    cameraId: 'reception',
    cameraName: 'Reception Cam',
    severityLevel: 'Moderate',
    alertTitle: 'Repeated Access Attempts',
    suspiciousActivity: 'Three failed badge attempts within two minutes',
    location: 'Reception',
    timestamp: '11:02am, 09-14-25',
    threatScorePct: 55,
    thumbnail: require('../../assets/images/cam_feed_2.png'),
  },
  {
    id: '10',
    cameraId: 'lodge',
    cameraName: 'Lodge Cam',
    severityLevel: 'High Level',
    alertTitle: 'Suspicious Activity Detected',
    suspiciousActivity: 'Person concealed face approaching main lodge',
    location: 'Main Entrance',
    timestamp: '8:36pm, 09-18-25',
    threatScorePct: 81,
    thumbnail: require('../../assets/images/cam_feed_3.png'),
  },
]
