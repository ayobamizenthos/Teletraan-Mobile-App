import { NOTIFICATIONS, RECENT_SEARCHES, type NotificationGroup } from '../data/notifications'

export function getNotifications(): NotificationGroup[] {
  return NOTIFICATIONS
}

export function getRecentSearches(): string[] {
  return RECENT_SEARCHES
}

// Backend: hit /notifications/mark-all-read. Screen handles the UI side
// (clears local state) — this is the swap point.
export function markAllNotificationsRead(): void {
  // no-op until wired up
}
