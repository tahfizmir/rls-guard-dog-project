
import { supabaseAdmin } from '../lib/supabaseAdmin'

async function run() {
  const pw = 'Test1234!'
  const sA = await supabaseAdmin.auth.admin.createUser({ email: 'studentA@example.test', password: pw })
  const sB = await supabaseAdmin.auth.admin.createUser({ email: 'studentB@example.test', password: pw })
  const t = await supabaseAdmin.auth.admin.createUser({ email: 'teacher@example.test', password: pw })

  const studentA = sA.user!
  const studentB = sB.user!
  const teacher = t.user!

  await supabaseAdmin.from('profiles').insert([
    { id: studentA.id, full_name: 'Student A' },
    { id: studentB.id, full_name: 'Student B' },
    { id: teacher.id, full_name: 'Teacher', is_teacher: true }
  ])

  const { data: classData } = await supabaseAdmin.from('classrooms').insert([{ name: 'Class 1', teacher_id: teacher.id }]).select().single()
  const classId = classData.id

  await supabaseAdmin.from('progress').insert([
    { student_id: studentB.id, classroom_id: classId, progress_json: { score: 75 } }
  ])

  console.log('seed complete. test passwords:', pw)
}

run().catch(console.error)
