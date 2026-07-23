import {
  ALERTS,
  INCIDENTS,
  PRIORITY_ALERTS,
  type Alert,
  type Incident,
  type PriorityAlert,
} from '../data/alerts'

export function getIncidents(): Incident[] {
  return INCIDENTS
}

export function getIncidentById(id: string): Incident | undefined {
  return INCIDENTS.find(i => i.id === id)
}

export function getPriorityAlerts(): PriorityAlert[] {
  return PRIORITY_ALERTS
}

export function getPriorityAlertById(id: string): PriorityAlert | undefined {
  return PRIORITY_ALERTS.find(a => a.id === id)
}

// Filter-chip helpers — derived directly from INCIDENTS so the modal only
// ever offers chips that match real data. Picking any chip is guaranteed to
// return at least one incident.
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export function getIncidentCameraOptions(): { id: string; label: string }[] {
  return Array.from(new Set(INCIDENTS.map(i => i.cameraName))).map(name => ({
    id: slugify(name),
    label: name,
  }))
}

export function getIncidentLocationOptions(): { id: string; label: string }[] {
  return Array.from(new Set(INCIDENTS.map(i => i.location))).map(name => ({
    id: slugify(name),
    label: name,
  }))
}

export function getIncidentTagOptions(): { id: string; label: string }[] {
  // Tags are derived from the first noun-phrase of each alertTitle so they
  // join cleanly against incidents (e.g. "Forced Entry Detected" → "Forced Entry").
  const titles = Array.from(new Set(INCIDENTS.map(i => i.alertTitle)))
  return titles.map(title => ({
    id: slugify(title),
    label: title.replace(/\s+Detected$/i, ''),
  }))
}

// Search the canonical INCIDENTS list (matches the cards shown on the
// Alerts page) so a query like "perimeter" or "garage" lights up the
// matching incident on the Search screen too. Each incident is reshaped
// into the legacy `Alert` shape the AlertCard component already renders.
export function searchAlerts(query: string): Alert[] {
  const q = query.trim().toLowerCase()
  const haystack = INCIDENTS
  const matched = q
    ? haystack.filter(
        i =>
          i.alertTitle.toLowerCase().includes(q) ||
          i.cameraName.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.suspiciousActivity.toLowerCase().includes(q)
      )
    : haystack
  return matched.map(i => ({
    id: i.id,
    severity: i.severityLevel,
    title: i.alertTitle,
    camera: i.cameraName,
    location: i.location,
    time: i.timestamp,
    banner: i.thumbnail,
  }))
}
