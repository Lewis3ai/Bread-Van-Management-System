import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDrives, fetchDrivers, fetchStreets, createDrive, updateDriveStatus } from '../lib/api'
import { Drive, Driver, Street } from '../types'
import StatusBadge from '../components/StatusBadge'
import { Plus, X, Loader2 } from 'lucide-react'

const STATUS_OPTIONS = ['SCHEDULED', 'EN_ROUTE', 'DONE']

export default function Drives() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editLocation, setEditLocation] = useState('')

  // New drive form state
  const [driverId, setDriverId] = useState('')
  const [streetId, setStreetId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  const { data: drives = [], isLoading } = useQuery<Drive[]>({
    queryKey: ['drives'],
    queryFn: fetchDrives,
  })
  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: fetchDrivers,
  })
  const { data: streets = [] } = useQuery<Street[]>({
    queryKey: ['streets'],
    queryFn: fetchStreets,
  })

  const createMutation = useMutation({
    mutationFn: createDrive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['drives'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      setShowForm(false)
      setDriverId('')
      setStreetId('')
      setScheduledAt('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => updateDriveStatus(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['drives'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      setEditId(null)
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!driverId || !streetId || !scheduledAt) return
    createMutation.mutate({ driver_id: +driverId, street_id: +streetId, scheduled_at: scheduledAt })
  }

  const startEdit = (d: Drive) => {
    setEditId(d.id)
    setEditStatus(d.status)
    setEditLocation(d.location_text)
  }

  const saveEdit = () => {
    if (!editId) return
    updateMutation.mutate({ id: editId, body: { status: editStatus, location_text: editLocation } })
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Drives</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage scheduled and active delivery runs</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'New Drive'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Driver</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select driver</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Street</label>
            <select
              value={streetId}
              onChange={(e) => setStreetId(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select street</option>
              {streets.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
            <input
              type="text"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              placeholder="e.g. 10:00 AM"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Schedule
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">#</th>
                  <th className="text-left px-5 py-3 font-medium">Driver</th>
                  <th className="text-left px-5 py-3 font-medium">Route</th>
                  <th className="text-left px-5 py-3 font-medium">Time</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Location</th>
                  <th className="text-right px-5 py-3 font-medium">Stops</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {drives.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">#{d.id}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{d.driver_name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{d.street_name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{d.scheduled_at}</td>
                    <td className="px-5 py-3.5">
                      {editId === d.id ? (
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="border border-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <StatusBadge status={d.status} />
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-xs">
                      {editId === d.id ? (
                        <input
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="border border-slate-300 rounded-lg px-2 py-1 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Current location"
                        />
                      ) : (
                        <span className="truncate block max-w-[180px]">{d.location_text || '—'}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-600">{d.stop_count}</td>
                    <td className="px-5 py-3.5 text-right">
                      {editId === d.id ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={saveEdit}
                            disabled={updateMutation.isPending}
                            className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-1"
                          >
                            {updateMutation.isPending && <Loader2 size={10} className="animate-spin" />}
                            Save
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="text-xs text-slate-500 px-3 py-1 rounded-lg hover:bg-slate-100 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(d)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {drives.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 text-sm">
                      No drives yet — schedule one above
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

