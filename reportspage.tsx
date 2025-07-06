import React, { useState, useEffect } from 'react'
import type { Transaction } from '../types/Transaction'
import { TransactionService } from '../services/TransactionService'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip as RechartTooltip,
} from 'recharts'

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#8884d8',
  Utilities: '#82ca9d',
  Entertainment: '#ffc658',
  Travel: '#8dd1e1',
  Health: '#a4de6c',
  Other: '#d0ed57',
}

const formatDate = (d: Date) => d.toISOString().slice(0, 10)

export default function ReportsPage(): JSX.Element {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string>(
    formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  )
  const [endDate, setEndDate] = useState<string>(formatDate(new Date()))

  useEffect(() => {
    setLoading(true)
    setError(null)
    // Fetch only transactions in the date range
    TransactionService.getTransactions({ startDate, endDate })
      .then(setTransactions)
      .catch((e) => setError(e.message || 'Failed to load transactions'))
      .finally(() => setLoading(false))
  }, [startDate, endDate])

  const startTs = new Date(startDate).getTime()
  const endTs = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1

  const filtered = transactions.filter((t) => {
    const tTs = new Date(t.date).getTime()
    return tTs >= startTs && tTs <= endTs
  })

  const categoryData = Object.entries(
    filtered.reduce<Record<string, number>>((acc, t) => {
      if (t.type === 'expense') {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
      }
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  const monthlyData = Object.entries(
    filtered.reduce<Record<string, number>>((acc, t) => {
      if (t.type === 'expense') {
        const month = new Date(t.date).toISOString().slice(0, 7)
        acc[month] = (acc[month] || 0) + Math.abs(t.amount)
      }
      return acc
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))

  const exportCSV = () => {
    const header = ['Date', 'Type', 'Category', 'Amount']
    const rows = filtered.map((t) => [
      new Date(t.date).toISOString().slice(0, 10),
      t.type,
      t.category,
      t.amount.toFixed(2),
    ])
    const csvContent =
      [header, ...rows]
        .map((r) => r.map((v) => `"${v}"`).join(','))
        .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report_${startDate}_${endDate}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  if (loading) return <div className="reports-page">Loading...</div>
  if (error) return <div className="reports-page error">{error}</div>

  return (
    <div className="reports-page">
      <header className="reports-header">
        <h1>Reports</h1>
        <div className="date-filters">
          <label>
            From{' '}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            To{' '}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <button onClick={exportCSV} className="export-btn">
            Export CSV
          </button>
        </div>
      </header>
      <section className="charts">
        <div className="chart-wrapper">
          <h2>Expenses by Category</h2>
          {categoryData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {categoryData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={CATEGORY_COLORS[entry.name] || '#ccc'}
                    />
                  ))}
                </Pie>
                <RechartTooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No expense data for selected period.</p>
          )}
        </div>
        <div className="chart-wrapper">
          <h2>Monthly Spending</h2>
          {monthlyData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartTooltip />
                <Legend />
                <Bar dataKey="total" name="Expense" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No expense data for selected period.</p>
          )}
        </div>
      </section>
      <section className="transaction-table">
        <h2>Transactions</h2>
        {filtered.length ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toISOString().slice(0, 10)}</td>
                  <td>{t.type}</td>
                  <td>{t.category}</td>
                  <td className={t.type === 'expense' ? 'negative' : 'positive'}>
                    {t.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No transactions in this period.</p>
        )}
      </section>
    </div>
  )
}