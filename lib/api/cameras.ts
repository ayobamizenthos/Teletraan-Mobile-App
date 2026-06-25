import { CAMERA_FEEDS, type CameraFeed } from '../data/cameras'

export function getCameraFeeds(): CameraFeed[] {
  return CAMERA_FEEDS
}

export function getCameraById(id: string): CameraFeed | undefined {
  return CAMERA_FEEDS.find(c => c.id === id)
}

export function searchCameras(query: string): CameraFeed[] {
  const q = query.trim().toLowerCase()
  if (!q) return CAMERA_FEEDS
  return CAMERA_FEEDS.filter(
    c => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)
  )
}
