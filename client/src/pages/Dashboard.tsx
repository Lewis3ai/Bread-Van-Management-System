import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchStats, fetchDrives, fetchStreets } from '../lib/api'
import { getSocket } from '../lib/socket'
import StatsCard from '../components/StatsCard'
import StatusBadge from '../components/StatusBadge'
import DriveMap from '../components/DriveMap'
import ActivityFeed from '../components/ActivityFeed'
import { Truck, MapPin, CheckCircle, Users } from 'lucide-react'
import { Stats, Drive, Street } from '../types'

export default function Dashboard() {
  const qc = useQueryClient()

  const { data: stats } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 15_000,
  })

  const { data: drives = [] } = useQuery<Drive[]>({
    queryKey: ['drives'],
    queryFn: fetchDrives,
    refetchInterval: 10_000,
  })

  const { data: streets = [] } = useQuery<Street[]>({
    queryKey: ['streets'],
    queryFn: fetchStreets,
  })

  // Invalidate queries on real-time updates
  useEffect(() => {
    const socket = getSocket()
    const refresh = () => {
      qc.invalidateQueries({ queryKey: ['drives'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    }
    socket.on('drive_updated', refresh)
    socket.on('drive_created', refresh)
    socket.on('stop_requested', refresh)
    return () => {
      socket.off('drive_updated', refresh)
      socket.off('drive_created', refresh)
      socket.off('stop_requested', refresh)
    }
  }, [qc])

  const activeDrives = drives.filter((d) => d.status === 'EN_ROUTE')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Operations Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Real-time overview of all bread van routes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Active Drives"
          value={stats?.active_drives ?? '—'}
          icon={Truck}
          accent="emerald"
          sub="Currently en route"
        />
        <StatsCard
          label="Scheduled"
          value={stats?.scheduled_drives ?? '—'}
          icon={MapPin}
          accent="amber"
          sub="Upcoming today"
        />
        <StatsCard
          label="Completed"
          value={stats?.completed_drives ?? '—'}
          icon={CheckCircle}
          accent="slate"
          sub="This session"
        />
        <StatsCard
          label="Stop Requests"
          value={stats?.pending_stops ?? '—'}
          icon={Users}
          accent="blue"
          sub="Total requests"
        />
      </div>

      {/* Map + Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <DriveMap drives={drives} streets={streets} />
        </div>
        <div className="h-[420px]">
          <ActivityFeed />
        </div>
      </div>

      {/* Active Drives Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Active Drives</h3>
          <span className="text-xs text-slate-400">{activeDrives.length} of {drives.length} total</span>
        </div>
        {activeDrives.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">No drives currently en route</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Driver</th>
                  <th className="text-left px-5 py-3 font-medium">Route</th>
                  <th className="text-left px-5 py-3 font-medium">Scheduled</th>
                  <th className="text-left px-5 py-3 font-medium">Location</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Stops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeDrives.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{d.driver_name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{d.street_name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{d.scheduled_at}</td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{d.location_text || '—'}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={d.status} /></td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{d.stop_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

