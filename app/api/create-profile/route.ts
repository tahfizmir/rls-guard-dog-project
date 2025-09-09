/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin' 

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const fullName = typeof json.full_name === 'string' ? json.full_name : null

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.split(' ')[1] || null
    if (!token) return NextResponse.json({ error: 'missing token' }, { status: 401 })

    // Verify token -> get user id
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData.user) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 })
    }
    const userId = userData.user.id

    // Create or update the profile
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: userId, full_name: fullName ?? '', is_teacher: false, created_at: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.error('create-profile error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message ?? 'server error' }, { status: 500 })
  }
}
