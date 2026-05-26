import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchDrivers, fetchStreets, createDriver, createStreet } from '../lib/api'
import { Driver, Street } from '../types'
import { Plus, Loader2, Truck, MapPin } from 'lucide-react'

type Tab = 'drivers' | 'streets'

export default function Fleet() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('drivers')
  const [driverName, setDriverName] = useState('')
  const [streetName, setStreetName] = useState('')
  const [streetLat, setStreetLat] = useState('')
  const [streetLng, setStreetLng] = useState('')

  const { data: drivers = [], isLoading: loadingDrivers } = useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: fetchDrivers,
  })

  const { data: streets = [], isLoading: loadingStreets } = useQuery<Street[]>({
    queryKey: ['streets'],
    queryFn: fetchStreets,
  })

  const addDriverMutation = useMutation({
    mutationFn: () => createDriver(driverName.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['drivers'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      setDriverName('')
    },
  })

  const addStreetMutation = useMutation({
    mutationFn: () =>
      createStreet({
        name: streetName.trim(),
        lat: parseFloat(streetLat) || 0,
        lng: parseFloat(streetLng) || 0,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['streets'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      setStreetName('')
      setStreetLat('')
      setStreetLng('')
    },
  })

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Fleet Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage drivers and delivery streets</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {(['drivers', 'streets'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium capitalize transition ${
              tab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'drivers' ? <Truck size={14} /> : <MapPin size={14} />}
            {t}
          </button>
        ))}
      </div>

      {/* Drivers panel */}
      {tab === 'drivers' && (
        <div className="space-y-4">
          {/* Add form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Add Driver</h3>
            <form
              onSubmit={(e) => { e.preventDefault(); addDriverMutation.mutate() }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Driver full name"
                required
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={addDriverMutation.isPending || !driverName.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                {addDriverMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add
              </button>
            </form>
          </div>

          {/* Drivers grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {loadingDrivers ? (
              <div className="col-span-4 flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-slate-400" />
              </div>
            ) : (
              drivers.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 hover:border-blue-300 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                    {d.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{d.name}</p>
                    <p className="text-xs text-slate-400">ID #{d.id}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Streets panel */}
      {tab === 'streets' && (
        <div className="space-y-4">
          {/* Add form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Add Delivery Street</h3>
            <form
              onSubmit={(e) => { e.preventDefault(); addStreetMutation.mutate() }}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3"
            >
              <input
                type="text"
                value={streetName}
                onChange={(e) => setStreetName(e.target.value)}
                placeholder="Street name"
                required
                className="sm:col-span-2 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="any"
                value={streetLat}
                onChange={(e) => setStreetLat(e.target.value)}
                placeholder="Latitude"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="any"
                value={streetLng}
                onChange={(e) => setStreetLng(e.target.value)}
                placeholder="Longitude"
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={addStreetMutation.isPending || !streetName.trim()}
                className="sm:col-start-4 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                {addStreetMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                Add
              </button>
            </form>
          </div>

          {/* Streets list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Street Name</th>
                  <th className="text-left px-5 py-3 font-medium">Latitude</th>
                  <th className="text-left px-5 py-3 font-medium">Longitude</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingStreets ? (
                  <tr><td colSpan={3} className="py-8 text-center"><Loader2 size={18} className="animate-spin text-slate-400 mx-auto" /></td></tr>
                ) : streets.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-amber-500 flex-shrink-0" />
                        {s.name}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{s.lat || '—'}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{s.lng || '—'}</td>
                  </tr>
                ))}
                {streets.length === 0 && !loadingStreets && (
                  <tr><td colSpan={3} className="py-8 text-center text-slate-400 text-sm">No streets yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


