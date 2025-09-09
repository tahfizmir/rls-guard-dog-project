// app/signup/page.tsx
'use client'
import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })

    setLoading(false)
    if (error) {
      setMessage(`Error: ${error.message}`)
      return
    }

  
    const accessToken = (data as any)?.session?.access_token ?? null

    if (accessToken) {
      // create the profiles row server-side (safe: uses service role API)
      try {
        const resp = await fetch('/api/create-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ full_name: fullName })
        })
        const body = await resp.json()
        if (!resp.ok) throw new Error(body?.error || 'failed create-profile')
        setMessage('Signed up and profile created. You are signed in!')
      } catch (err: any) {
        
        setMessage('Signed up, but failed to create profile: ' + (err.message ?? err))
      }
      return
    }

    // No access token -> email confirmation flow
    setMessage('Check your email to confirm sign-up. After confirming, sign in to continue.')
  }

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
      <form onSubmit={handleSignUp} className="space-y-3">
        <div>
          <label className="block text-sm">Full name</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)} className="border px-2 py-1 w-full" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="border px-2 py-1 w-full" />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border px-2 py-1 w-full" />
        </div>
        <button disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded">
          {loading ? 'Signing up...' : 'Sign up'}
        </button>
      </form>
      {message && <div className="mt-3 text-sm text-slate-700">{message}</div>}
    </div>
  )
}
