export interface NotificationCard {
  id: string
  // Optional — when present, the "View Alert Footage" link opens that
  // specific incident on the detail screen instead of the default one.
  incidentId?: string
  timestamp: string
  title: string
  subtitle: string
  hasFootageLink: boolean
  iconType: 'alert' | 'primus'
}

export interface NotificationGroup {
  label: string
  items: NotificationCard[]
}

export const NOTIFICATIONS: NotificationGroup[] = [
  {
    label: 'Today',
    items: [
      {
        id: '1',
        incidentId: '5',
        timestamp: '3 mins ago',
        title: 'Repeated Loitering Detected',
        subtitle: 'Parking Lot A – Face not recognized',
        hasFootageLink: true,
        iconType: 'alert',
      },
      {
        id: '2',
        incidentId: '4',
        timestamp: '3 mins ago',
        title: 'Unknown Face Detected',
        subtitle: 'Reception – Visitor tailgated',
        hasFootageLink: true,
        iconType: 'alert',
      },
      {
        id: '3',
        incidentId: '1',
        timestamp: '3 mins ago',
        title: 'Forced Entry Detected',
        subtitle: 'Parking Lot A – Rear gate forced',
        hasFootageLink: true,
        iconType: 'alert',
      },
      {
        id: '4',
        incidentId: '10',
        timestamp: '3 mins ago',
        title: 'Suspicious Activity Detected',
        subtitle: 'Main Entrance – Face concealed at lodge',
        hasFootageLink: true,
        iconType: 'alert',
      },
    ],
  },
  {
    label: '25-05-25',
    items: [
      {
        id: '5',
        incidentId: '3',
        timestamp: '25 mins ago',
        title: 'PRIMUS detected anomaly pattern',
        subtitle: 'Main Entrance – potential recon behavior',
        hasFootageLink: true,
        iconType: 'primus',
      },
      {
        id: '6',
        incidentId: '9',
        timestamp: '3 mins ago',
        title: 'Repeated Access Attempts',
        subtitle: 'Reception – Three failed badge attempts',
        hasFootageLink: true,
        iconType: 'alert',
      },
      {
        id: '7',
        incidentId: '7',
        timestamp: '3 mins ago',
        title: 'After-hours Access',
        subtitle: 'Office-2 Lobby – Badge outside shift',
        hasFootageLink: true,
        iconType: 'alert',
      },
    ],
  },
]

export const RECENT_SEARCHES = ['Staff Room Cam', 'Object Detection', 'Backyard Door', 'reel back']
