import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Return() {
  const [loans, setLoans] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function load() {
    const { data, error } = await supabase
      .from('loans')
      .select('id, borrower_name, quantity, loan_date, items(code, name)')
      .eq('status', 'DIPINJAM')
      .order('loan_date', { ascending: true })
    if (error) setError('Gagal memuat data')
    else setLoans(data)
  }
  useEffect(() => { load() }, [])

  async function giveBack(l) {
    if (!confirm(`Proses pengembalian ${l.items?.name} dari ${l.borrower_name}?`)) return
    setError(''); setSuccess('')
    const { error } = await supabase.rpc('return_item', { p_loan: l.id })
    if (error) { setError(error.message); return }
    setSuccess('Pengembalian berhasil diproses')
    load()
  }

  return (
    <div>
      <h2>Pengembalian Barang</h2>
      {error && <p className="error">{error}</p>}
      {success && <p style={{ color: '#166534' }}>{success}</p>}
      <div className="panel">
        <table>
          <thead>
            <tr><th>Peminjam</th><th>Barang</th><th>Jumlah</th><th>Tgl Pinjam</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {loans.length === 0 && <tr><td colSpan="5">Tidak ada barang yang sedang dipinjam</td></tr>}
            {loans.map((l) => (
              <tr key={l.id}>
                <td>{l.borrower_name}</td>
                <td>{l.items?.code} - {l.items?.name}</td>
                <td>{l.quantity}</td>
                <td>{l.loan_date}</td>
                <td><button onClick={() => giveBack(l)}>Kembalikan</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}