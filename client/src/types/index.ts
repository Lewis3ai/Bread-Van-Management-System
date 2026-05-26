export interface Driver {
  id: number
  name: string
}

export interface Street {
  id: number
  name: string
  lat: number
  lng: number
}

export interface Drive {
  id: number
  driver_id: number
  driver_name: string | null
  street_id: number
  street_name: string | null
  street_lat: number
  street_lng: number
  scheduled_at: string
  status: 'SCHEDULED' | 'EN_ROUTE' | 'DONE'
  location_text: string
  driver_lat: number
  driver_lng: number
  stop_count: number
}

export interface StopRequest {
  id: number
  drive_id: number
  resident_id: number
  resident_name: string | null
  note: string
}

export interface Stats {
  total_drives: number
  active_drives: number
  scheduled_drives: number
  completed_drives: number
  pending_stops: number
  drivers_count: number
  streets_count: number
}
