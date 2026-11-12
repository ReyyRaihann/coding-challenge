import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

async function callApi(body) {
  const { data } = await supabase.auth.getSession()
  const res = await fetch('/api/create-staff', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: JSON.stringify(body),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Terjadi kesalahan')
}

export default function Users() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [form, setForm] = useState(null)       // tambah staff
  const [edit, setEdit] = useState(null)       // edit data
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at')
    if (error) setError('Gagal memuat pengguna')
    else setUsers(data)
  }
  useEffect(() => { load() }, [])

  function notify(ok, msg) {
    setError(ok ? '' : msg); setSuccess(ok ? msg : '')
  }

  async function addStaff(e) {
    e.preventDefault()
    try {
      await callApi({ action: 'create', ...form })
      notify(true, 'Akun staff berhasil dibuat')
      setForm(null); load()
    } catch (err) { notify(false, err.message) }
  }

  async function saveEdit(e) {
    e.preventDefault()
    if (!edit.full_name.trim()) return notify(false, 'Nama tidak boleh kosong')
    const { error } = await supabase.from('profiles')
      .update({ full_name: edit.full_name.trim() }).eq('id', edit.id)
    if (error) return notify(false, error.message)
    if (edit.password) {
      try { await callApi({ action: 'password', id: edit.id, password: edit.password }) }
      catch (err) { return notify(false, err.message) }
    }
    notify(true, 'Data pengguna diperbarui')
    setEdit(null); load()
  }

  async function toggle(u) {
    const { error } = await supabase.from('profiles')
      .update({ is_active: !u.is_active }).eq('id', u.id)
    if (error) notify(false, error.message)
    else { notify(true, u.is_active ? 'Akun dinonaktifkan' : 'Akun diaktifkan'); load() }
  }

  return (
    <div>
      <h2>Manajemen Pengguna</h2>
      <div className="toolbar">
        <button onClick={() => { setForm({ username: '', full_name: '', password: '' }); setEdit(null) }}>
          + Tambah Staff
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {success && <p style={{ color: '#166534' }}>{success}</p>}

      {form && (
        <form className="form" onSubmit={addStaff}>
          <input placeholder="Username" value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input placeholder="Nama lengkap" value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <input type="password" placeholder="Password (min. 6)" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <div className="actions">
            <button type="submit">Simpan</button>
            <button type="button" className="gray" onClick={() => setForm(null)}>Batal</button>
          </div>
        </form>
      )}

      {edit && (
        <form className="form" onSubmit={saveEdit}>
          <input value={edit.username} disabled />
          <input placeholder="Nama lengkap" value={edit.full_name}
            onChange={(e) => setEdit({ ...edit, full_name: e.target.value })} />
          <input type="password" placeholder="Password baru (kosongkan jika tidak diganti)"
            value={edit.password}
            onChange={(e) => setEdit({ ...edit, password: e.target.value })} />
          <div className="actions">
            <button type="submit">Simpan</button>
            <button type="button" className="gray" onClick={() => setEdit(null)}>Batal</button>
          </div>
        </form>
      )}

      <div className="panel">
        <table>
          <thead>
            <tr><th>Username</th><th>Nama</th><th>Role</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.full_name}</td>
                <td>{u.role}</td>
                <td>
                  <span className={`badge ${u.is_active ? 'ok' : 'warn'}`}>
                    {u.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="actions">
                  <button onClick={() => { setEdit({ ...u, password: '' }); setForm(null) }}>Edit</button>
                  {u.id !== me.id && (
                    <button className={u.is_active ? 'red' : 'gray'} onClick={() => toggle(u)}>
                      {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}