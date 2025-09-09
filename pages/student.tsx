/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Row = { id: string; progress_json: any; updated_at: string; classroom_id?: string }

export default function StudentPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      const r = await supabase.from('progress').select('*')
      if (!mounted) return
      setLoading(false)
      if (r.error) console.error(r.error)
      else setRows(r.data as Row[])
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Your Progress</h1>
      {loading && <div>Loading...</div>}
      {!loading && rows.length === 0 && <div>No progress found.</div>}
      <ul className="space-y-3">
        {rows.map(r => (
          <li key={r.id} className="border p-3 rounded">
            <div className="text-xs text-gray-500">Updated: {new Date(r.updated_at).toLocaleString()}</div>
            <pre className="mt-2 text-sm">{JSON.stringify(r.progress_json, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  )
}
