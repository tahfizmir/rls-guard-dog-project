/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Row = { id: string; student_id: string; progress_json: any; updated_at: string }

export default function TeacherPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const r = await supabase.from('progress').select('*')
      setLoading(false)
      if (r.error) console.error(r.error)
      else setRows(r.data as Row[])
    }
    load()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Teacher - Classroom Progress</h1>
      {loading && <div>Loading...</div>}
      <ul className="space-y-3">
        {rows.map(r => (
          <li key={r.id} className="border p-3 rounded">
            <div className="text-sm text-gray-600">Student: {r.student_id} • Updated: {new Date(r.updated_at).toLocaleString()}</div>
            <pre className="mt-2">{JSON.stringify(r.progress_json, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  )
}
