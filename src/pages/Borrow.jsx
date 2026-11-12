import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const today = () => new Date().toISOString().slice(0, 10)

export default function Borrow() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ borrower: '', item: '', qty: 1, date: today() })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('items').select('id, code, name, stock_available')
      .gt('stock_available', 0).order('code')
    setItems(data || [])
  }
  useEffect(() => { load() }, [])

  const selected = items.find((i) => i.id === form.item)

  async function submit(e) {
    e.preventDefault()
    setError(''); setSuccess('')
    const qty = Number(form.qty)
    if (!form.borrower.trim() || !form.item || !form.date || !qty || qty < 1) {
      setError('Semua kolom wajib diisi dengan benar')
      return
    }
    if (selected && qty > selected.stock_available) {
      setError(`Stok tersedia hanya ${selected.stock_available}`)
      return
    }
    setBusy(true)
    const { error } = await supabase.rpc('borrow_item', {
      p_borrower: form.borrower.trim(),
      p_item: form.item,
      p_qty: qty,
      p_date: form.date,
    })
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    setSuccess('Peminjaman berhasil disimpan')
    setForm({ borrower: '', item: '', qty: 1, date: today() })
    load()
  }

  return (
    <div>
      <h2>Peminjaman Barang</h2>
      <div className="panel" style={{ maxWidth: 520 }}>
        <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
          <label>Nama peminjam
            <input style={{ width: '100%' }} value={form.borrower}
              onChange={(e) => setForm({ ...form, borrower: e.target.value })} />
          </label>
          <label>Barang
            <select style={{ width: '100%' }} value={form.item}
              onChange={(e) => setForm({ ...form, item: e.target.value })}>
              <option value="">-- Pilih barang --</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.code} - {i.name} (tersedia {i.stock_available})
                </option>
              ))}
            </select>
          </label>
          <label>Jumlah
            <input style={{ width: '100%' }} type="number" min="1"
              max={selected?.stock_available || undefined} value={form.qty}
              onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          </label>
          <label>Tanggal peminjaman
            <input style={{ width: '100%' }} type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </label>
          {error && <p className="error" style={{ margin: 0 }}>{error}</p>}
          {success && <p style={{ margin: 0, color: '#166534' }}>{success}</p>}
          <button disabled={busy}>{busy ? 'Menyimpan...' : 'Simpan Transaksi'}</button>
        </form>
      </div>
    </div>
  )
}