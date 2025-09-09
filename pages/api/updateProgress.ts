
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { getMongo } from '../../lib/mongo'

async function getUserIdFromToken(token?: string | null) {
  if (!token) return null
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error) return null
    return data.user?.id ?? null
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id, progress_json } = req.body
  if (!id || !progress_json) return res.status(400).json({ error: 'id and progress_json required' })

  const authHeader = (req.headers.authorization as string) || ''
  const token = authHeader.split(' ')[1] || null
  const actorId = await getUserIdFromToken(token)
  if (!actorId) return res.status(401).json({ error: 'unauthenticated' })


  const { data: existing, error: fetchErr } = await supabaseAdmin.from('progress').select('*').eq('id', id).single()
  if (fetchErr || !existing) return res.status(404).json({ error: 'not found' })

  const studentId = existing.student_id
  const classroomId = existing.classroom_id


  let allowed = false
  if (actorId === studentId) allowed = true
  if (!allowed) {
    const { data: cls, error: clsErr } = await supabaseAdmin.from('classrooms').select('teacher_id').eq('id', classroomId).single()
    if (!clsErr && cls?.teacher_id === actorId) allowed = true
  }
  if (!allowed) return res.status(403).json({ error: 'forbidden' })

  const { data: updated, error: updateErr } = await supabaseAdmin.from('progress').update({ progress_json, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (updateErr) return res.status(500).json({ error: updateErr.message })


  try {
    const db = await getMongo()
    await db.collection('audit_logs').insertOne({
      progress_id: id,
      acted_by: actorId,
      action: 'update_progress',
      before: existing.progress_json,
      after: progress_json,
      ts: new Date()
    })
  } catch (e) {
    console.error('mongo error', e)
  }

  return res.status(200).json({ updated })
}
