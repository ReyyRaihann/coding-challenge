import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // 1. Verifikasi pemanggil: harus ADMIN aktif
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  const { data: auth } = await admin.auth.getUser(token)
  if (!auth?.user) return res.status(401).json({ error: 'Belum login' })

  const { data: me } = await admin
    .from('profiles').select('role, is_active').eq('id', auth.user.id).single()
  if (!me || me.role !== 'ADMIN' || !me.is_active)
    return res.status(403).json({ error: 'Hanya admin yang diizinkan' })

  const { action, username, full_name, password, id } = req.body || {}

  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Password minimal 6 karakter' })

  // 2. Reset password staff
  if (action === 'password') {
    const { error } = await admin.auth.admin.updateUserById(id, { password })
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ ok: true })
  }

  // 3. Buat akun staff
  const uname = (username || '').trim().toLowerCase()
  if (!/^[a-z0-9_.-]{3,}$/.test(uname))
    return res.status(400).json({ error: 'Username minimal 3 karakter (huruf, angka, _ . -)' })
  if (!full_name?.trim())
    return res.status(400).json({ error: 'Nama lengkap wajib diisi' })

  const { data: created, error } = await admin.auth.admin.createUser({
    email: `${uname}@lab.local`,
    password,
    email_confirm: true,
  })
  if (error) return res.status(400).json({ error: 'Gagal membuat akun: ' + error.message })

  const { error: pErr } = await admin.from('profiles').insert({
    id: created.user.id, username: uname, full_name: full_name.trim(), role: 'STAFF',
  })
  if (pErr) {
    await admin.auth.admin.deleteUser(created.user.id) // batalkan jika profil gagal
    return res.status(400).json({ error: 'Gagal menyimpan profil: ' + pErr.message })
  }
  res.json({ ok: true })
}