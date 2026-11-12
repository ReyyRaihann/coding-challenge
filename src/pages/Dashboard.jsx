import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, available: 0, borrowed: 0, loans: 0 })
  const [recent, setRecent] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const items = await supabase.from('items').select('stock_total, stock_available')
      const loans = await supabase.from('loans').select('id', { count: 'exact', head: true })
      const last = await supabase
        .from('loans')
        .select('id, borrower_name, quantity, status, loan_date, items(name)')
        .order('created_at', { ascending: false })
        .limit(5)

      if (items.error || loans.error || last.error) {
        setError('Gagal memuat data dashboard')
        return
      }
      const total = items.data.reduce((s, i) => s + i.stock_total, 0)
      const available = items.data.reduce((s, i) => s + i.stock_available, 0)
      setStats({ total, available, borrowed: total - available, loans: loans.count || 0 })
      setRecent(last.data)
    }
    load()
  }, [])

  return (
    <div>
      <h2>Dashboard</h2>
      {error && <p className="error">{error}</p>}

      <div className="cards">
        <div className="card"><span>Total Barang</span><strong>{stats.total}</strong></div>
        <div className="card"><span>Barang Tersedia</span><strong>{stats.available}</strong></div>
        <div className="card"><span>Barang Dipinjam</span><strong>{stats.borrowed}</strong></div>
        <div className="card"><span>Total Transaksi</span><strong>{stats.loans}</strong></div>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Aktivitas Terbaru</h3>
        <table>
          <thead>
            <tr><th>Peminjam</th><th>Barang</th><th>Jumlah</th><th>Tanggal</th><th>Status</th></tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan="5">Belum ada transaksi</td></tr>
            )}
            {recent.map((l) => (
              <tr key={l.id}>
                <td>{l.borrower_name}</td>
                <td>{l.items?.name}</td>
                <td>{l.quantity}</td>
                <td>{l.loan_date}</td>
                <td>
                  <span className={`badge ${l.status === 'SELESAI' ? 'ok' : 'warn'}`}>{l.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}