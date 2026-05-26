import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchStopRequests, fetchDrives, createStopRequest } from '../lib/api'
import { StopRequest, Drive } from '../types'
import { Plus, Loader2, MapPin } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'

export default function Requests() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [driveId, setDriveId] = useState('')
  const [residentId, setResidentId] = useState('')
  const [note, setNote] = useState('')

  const { data: stops = [], isLoading } = useQuery<StopRequest[]>({
    queryKey: ['stop-requests'],
    queryFn: fetchStopRequests,
    refetchInterval: 15_000,
  })

  const { data: drives = [] } = useQuery<Drive[]>({
    queryKey: ['drives'],
    queryFn: fetchDrives,
  })

  const createMutation = useMutation({
    mutationFn: createStopRequest,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stop-requests'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      setShowForm(false)
      setDriveId('')
      setResidentId('')
      setNote('')
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!driveId || !residentId) return
    createMutation.mutate({ drive_id: +driveId, resident_id: +residentId, note })
  }

  const activeDrives = drives.filter((d) => d.status !== 'DONE')

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stop Requests</h1>
          <p className="text-sm text-slate-500 mt-0.5">Resident delivery stop requests</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {showForm ? '✕ Cancel' : <><Plus size={15} /> New Request</>}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Drive</label>
            <select
              value={driveId}
              onChange={(e) => setDriveId(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select drive</option>
              {activeDrives.map((d) => (
                <option key={d.id} value={d.id}>
                  #{d.id} — {d.driver_name} on {d.street_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Resident ID</label>
            <input
              type="number"
              value={residentId}
              onChange={(e) => setResidentId(e.target.value)}
              placeholder="User ID"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. 2 loaves of bread"
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
              Submit
            </button>
          </div>
        </form>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{stops.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Requests</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {stops.filter((s) => drives.find((d) => d.id === s.drive_id)?.status === 'EN_ROUTE').length}
          </p>
          <p className="text-xs text-slate-500 mt-1">On Active Drives</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-slate-500">
            {stops.filter((s) => drives.find((d) => d.id === s.drive_id)?.status === 'DONE').length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Completed</p>
        </div>
      </div>

      {/* Requests table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">#</th>
                  <th className="text-left px-5 py-3 font-medium">Drive</th>
                  <th className="text-left px-5 py-3 font-medium">Resident</th>
                  <th className="text-left px-5 py-3 font-medium">Note</th>
                  <th className="text-left px-5 py-3 font-medium">Drive Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stops.map((s) => {
                  const drive = drives.find((d) => d.id === s.drive_id)
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-xs">#{s.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-amber-500 flex-shrink-0" />
                          <span className="text-slate-700 font-medium">
                            {drive ? `${drive.driver_name} → ${drive.street_name}` : `Drive #${s.drive_id}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{s.resident_name ?? `User #${s.resident_id}`}</td>
                      <td className="px-5 py-3.5 text-slate-500 max-w-xs">
                        <span className="truncate block max-w-[260px]">{s.note || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {drive ? <StatusBadge status={drive.status} /> : <span className="text-slate-400 text-xs">Unknown</span>}
                      </td>
                    </tr>
                  )
                })}
                {stops.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 text-sm">
                      No stop requests yet
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


