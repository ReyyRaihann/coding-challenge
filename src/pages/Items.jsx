import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const empty = { code: '', name: '', category: '', stock: '' }

export default function Items() {
  const { user } = useAuth()
  const isAdmin = user.role === 'ADMIN'
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(null)   // null = form tertutup
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    const { data, error } = await supabase.from('items').select('*').order('code')
    if (error) setError('Gagal memuat barang')
    else setItems(data)
  }

  useEffect(() => { load() }, [])

  const filtered = items.filter((i) =>
    [i.code, i.name, i.category].join(' ').toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() { setEditing(null); setForm(empty); setError('') }
  function openEdit(i) {
    setEditing(i)
    setForm({ code: i.code, name: i.name, category: i.category, stock: i.stock_total })
    setError('')
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    const stock = Number(form.stock)
    if (!form.code || !form.name || !form.category || isNaN(stock) || stock < 0) {
      setError('Semua kolom wajib diisi dengan benar')
      return
    }

    let res
    if (editing) {
      const newAvailable = editing.stock_available + (stock - editing.stock_total)
      if (newAvailable < 0) {
        setError('Stok total tidak boleh kurang dari jumlah yang sedang dipinjam')
        return
      }
      res = await supabase.from('items').update({
        code: form.code.trim(), name: form.name.trim(), category: form.category.trim(),
        stock_total: stock, stock_available: newAvailable,
      }).eq('id', editing.id)
    } else {
      res = await supabase.from('items').insert({
        code: form.code.trim(), name: form.name.trim(), category: form.category.trim(),
        stock_total: stock, stock_available: stock,
      })
    }

    if (res.error) {
      setError(res.error.code === '23505' ? 'Kode barang sudah dipakai' : 'Gagal menyimpan: ' + res.error.message)
      return
    }
    setForm(null)
    load()
  }

  async function remove(i) {
    if (!confirm(`Hapus ${i.name}?`)) return
    const { error } = await supabase.from('items').delete().eq('id', i.id)
    if (error) {
      setError(error.code === '23503'
        ? 'Barang tidak bisa dihapus karena sudah punya riwayat peminjaman'
        : 'Gagal menghapus: ' + error.message)
    } else {
      setError('')
      load()
    }
  }

  return (
    <div>
      <h2>Data Barang</h2>

      <div className="toolbar">
        <input placeholder="Cari kode, nama, atau kategori..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
        {isAdmin && <button onClick={openAdd}>+ Tambah Barang</button>}
      </div>

      {error && <p className="error">{error}</p>}

      {isAdmin && form && (
        <form className="form" onSubmit={save}>
          <input placeholder="Kode (BR011)" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input placeholder="Nama barang" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Kategori" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input type="number" min="0" placeholder="Stok total" value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <div className="actions">
            <button type="submit">Simpan</button>
            <button type="button" className="gray" onClick={() => setForm(null)}>Batal</button>
          </div>
        </form>
      )}

      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Kode</th><th>Nama</th><th>Kategori</th><th>Stok Total</th><th>Tersedia</th>
              {isAdmin && <th>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan="6">Tidak ada data</td></tr>}
            {filtered.map((i) => (
              <tr key={i.id}>
                <td>{i.code}</td>
                <td>{i.name}</td>
                <td>{i.category}</td>
                <td>{i.stock_total}</td>
                <td>
                  <span className={`badge ${i.stock_available > 0 ? 'ok' : 'warn'}`}>
                    {i.stock_available > 0 ? i.stock_available : 'Habis'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="actions">
                    <button onClick={() => openEdit(i)}>Edit</button>
                    <button className="red" onClick={() => remove(i)}>Hapus</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}