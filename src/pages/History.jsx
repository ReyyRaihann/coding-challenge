import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function History() {
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('loans')
        .select('id, borrower_name, quantity, loan_date, return_date, status, items(code, name)')
        .order('created_at', { ascending: false })
      if (error) setError('Gagal memuat riwayat')
      else setRows(data)
    }
    load()
  }, [])

  const shown = rows.filter((r) =>
    (filter === 'ALL' || r.status === filter) &&
    `${r.borrower_name} ${r.items?.name} ${r.items?.code}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h2>Riwayat Peminjaman & Pengembalian</h2>
      <div className="toolbar">
        <input placeholder="Cari peminjam atau barang..." value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ALL">Semua status</option>
          <option value="DIPINJAM">Dipinjam</option>
          <option value="SELESAI">Selesai</option>
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="panel">
        <table>
          <thead>
            <tr>
              <th>Peminjam</th><th>Barang</th><th>Jumlah</th>
              <th>Tgl Pinjam</th><th>Tgl Kembali</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && <tr><td colSpan="6">Tidak ada data</td></tr>}
            {shown.map((r) => (
              <tr key={r.id}>
                <td>{r.borrower_name}</td>
                <td>{r.items?.code} - {r.items?.name}</td>
                <td>{r.quantity}</td>
                <td>{r.loan_date}</td>
                <td>{r.return_date || '-'}</td>
                <td>
                  <span className={`badge ${r.status === 'SELESAI' ? 'ok' : 'warn'}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}