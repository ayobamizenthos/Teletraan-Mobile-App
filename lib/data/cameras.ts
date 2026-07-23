// Demo camera data used until the backend is wired up.
// CAMERA_FEEDS is the single canonical list: every screen (quad-grid dashboard,
// single-camera view, filter modal, search) reads from it. Each entry has both
// a camera name and the location it covers, so filter-by-Camera and
// filter-by-Location both narrow the same dataset with no duplicate sources.

export interface CameraFeed {
  id: string
  name: string
  location: string
  isLive: boolean
  isOnline: boolean
  thumbnail: number
}

const FEED_THUMBS = [
  require('../../assets/images/cam_feed_1.png'),
  require('../../assets/images/cam_feed_2.png'),
  require('../../assets/images/cam_feed_3.png'),
  require('../../assets/images/cam_feed_4.png'),
]

// 12 cameras keyed by the same ids the filter modal returns when the user
// picks a Camera chip — so a modal selection maps 1:1 to a feed entry.
export const CAMERA_FEEDS: CameraFeed[] = [
  {
    id: 'car-park-1',
    name: 'Car Park Cam',
    location: 'Parking Lot A',
    isLive: true,
    isOnline: true,
    thumbnail: FEED_THUMBS[2],
  },
  {
    id: 'staff-room-cam',
    name: 'Staff room cam',
    location: 'Office-2 Lobby',
    isLive: true,
    isOnline: true,
    thumbnail: FEED_THUMBS[0],
  },
  {
    id: 'park-c',
    name: 'Park Cam2',
    location: 'Parking Lot A',
    isLive: true,
    isOnline: true,
    thumbnail: FEED_THUMBS[2],
  },
  {
    id: 'reception',
    name: 'Reception Cam',
    location: 'Reception',
    isLive: true,
    isOnline: true,
    thumbnail: FEED_THUMBS[1],
  },
  {
    id: 'toilet-1',
    name: 'Toilet Cam',
    location: 'Reception',
    isLive: false,
    isOnline: false,
    thumbnail: FEED_THUMBS[3],
  },
  {
    id: 'staff-room',
    name: 'Staff Room',
    location: 'Office-2 Lobby',
    isLive: true,
    isOnline: true,
    thumbnail: FEED_THUMBS[0],
  },
  {
    id: 'lodge',
    name: 'Lodge Cam',
    location: 'Main Entrance',
    isLive: true,
    isOnline: true,
    thumbnail: FEED_THUMBS[1],
  },
  {
    id: 'gate',
    name: 'Gate Cam',
    location: 'Main Entrance',
    isLive: true,
    isOnline: true,
    thumbnail: FEED_THUMBS[1],
  },
  {
    id: 'products',
    name: 'Products room',
    location: 'Production Room',
    isLive: false,
    isOnline: false,
    thumbnail: FEED_THUMBS[3],
  },
  {
    id: 'toilet-2',
    name: 'Toilet Cam',
    location: 'Cafeteria',
    isLive: true,
    isOnline: true,
    thumbnail: FEED_THUMBS[2],
  },
  {
    id: 'car-park-2',
    name: 'Car Park Cam',
    location: 'Loading Dock',
    isLive: true,
    isOnline: true,
    thumbnail: FEED_THUMBS[2],
  },
  {
    id: 'cafe',
    name: 'Cafe',
    location: 'Cafeteria',
    isLive: true,
    isOnline: true,
    thumbnail: FEED_THUMBS[0],
  },
]
