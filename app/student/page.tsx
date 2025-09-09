/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

type ProgressRow = { id: string; progress_json: any; updated_at: string; classroom_id?: string }

export default function StudentPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<any>(null)
  const [rows, setRows] = useState<ProgressRow[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(r => { if (!mounted) return; setSession(r.data.session) })
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      if (mounted) setSession(s?.session ?? null)
    })
    return () => { mounted = false; sub?.subscription?.unsubscribe?.() }
  }, [])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    supabase
      .from('progress')
      .select('*')
      .then(res => {
        setLoading(false)
        if (res.error) {
          console.error(res.error)
          setMsg(res.error.message)
        } else {
          setRows(res.data as ProgressRow[])
        }
      })
  }, [session])

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setMsg('Signing in...')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMsg(error.message)
    } else {
      setMsg('Signed in')
      setSession(data.session)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setRows([])
    setMsg('Signed out')
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Student</h2>

      {!session ? (
        <form onSubmit={signIn} className="space-y-2 max-w-md">
          <div>
            <label className="block text-sm">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="border px-2 py-1 w-full" />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border px-2 py-1 w-full" />
          </div>
          <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded">Sign in</button>
          <div className="text-sm text-red-600 mt-1">{msg}</div>
        </form>
      ) : (
        <div>
          <div className="mb-3">Signed in as <b>{session.user?.email ?? session.user?.phone ?? session.user?.id}</b></div>
          <button onClick={signOut} className="px-2 py-1 border rounded mb-4">Sign out</button>

          <h3 className="text-lg font-medium mb-2">Your progress</h3>
          {loading && <div>Loading...</div>}
          {!loading && rows.length === 0 && <div>No progress rows found for this account.</div>}
          <ul className="space-y-3">
            {rows.map(r => (
              <li key={r.id} className="p-3 border rounded">
                <div className="text-xs text-gray-500">Updated: {new Date(r.updated_at).toLocaleString()}</div>
                <pre className="mt-2 text-sm">{JSON.stringify(r.progress_json, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
