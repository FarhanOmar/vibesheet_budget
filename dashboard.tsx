import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import * as api from './apiclient'
import Spinner from '../components/Spinner'
import ErrorMessage from '../components/ErrorMessage'
import Card from '../components/Card'
import TransactionList from '../components/TransactionList'
import { CSVLink } from 'react-csv'
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line
} from 'recharts'
import styles from './dashboard.module.css'

type BudgetOverview = {
  totalIncome: number
  totalExpense: number
  budgetRemaining: number
}

type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
}

type NetWorthPoint = {
  date: string
  value: number
}

type Goal = {
  id: string
  title: string
  target: number
  current: number
}

const fetchBudgetOverview = async (): Promise<BudgetOverview> => {
  const { data } = await api.get('/budget/overview')
  return data
}

const fetchRecentTransactions = async (): Promise<Transaction[]> => {
  const { data } = await api.get('/transactions/recent')
  return data
}

const fetchNetWorthHistory = async (): Promise<NetWorthPoint[]> => {
  const { data } = await api.get('/networth/history')
  return data
}

const fetchGoals = async (): Promise<Goal[]> => {
  const { data } = await api.get('/goals')
  return data
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isAuthLoading } = useAuth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthLoading, isAuthenticated, navigate])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const {
    data: budgetOverview,
    isLoading: loadingBudget,
    error: budgetError
  } = useQuery<BudgetOverview>(['budgetOverview'], fetchBudgetOverview)

  const {
    data: recentTransactions,
    isLoading: loadingTransactions,
    error: transactionsError
  } = useQuery<Transaction[]>(['recentTransactions'], fetchRecentTransactions, {
    staleTime: 1000 * 60 * 5
  })

  const {
    data: netWorthHistory,
    isLoading: loadingNetWorth,
    error: netWorthError
  } = useQuery<NetWorthPoint[]>(['netWorthHistory'], fetchNetWorthHistory)

  const {
    data: goals,
    isLoading: loadingGoals,
    error: goalsError
  } = useQuery<Goal[]>(['goals'], fetchGoals)

  if (isAuthLoading) {
    return <Spinner />
  }

  const bo = budgetOverview ?? { totalIncome: 0, totalExpense: 0, budgetRemaining: 0 }
  const nwh = netWorthHistory ?? []
  const txns = recentTransactions ?? []
  const goalsList = goals ?? []

  return (
    <div className={styles.dashboard}>
      {!isOnline && (
        <div className={styles.offlineBanner}>
          You are offline. Some features may be unavailable.
        </div>
      )}

      <div className={styles.cardGrid}>
        {(loadingBudget || loadingNetWorth) && !budgetError && !netWorthError ? (
          <Spinner />
        ) : budgetError || netWorthError ? (
          <ErrorMessage message="Failed to load summary data." />
        ) : (
          <>
            <Card title="Income" value={`$${bo.totalIncome.toFixed(2)}`} />
            <Card title="Expenses" value={`$${bo.totalExpense.toFixed(2)}`} />
            <Card title="Budget Remaining" value={`$${bo.budgetRemaining.toFixed(2)}`} />
            <Card
              title="Net Worth"
              value={`$${nwh.length ? nwh[nwh.length - 1].value.toFixed(2) : '0.00'}`}
            />
          </>
        )}
      </div>

      <section className={styles.section}>
        <h2>Net Worth Over Time</h2>
        {loadingNetWorth && !netWorthError ? (
          <Spinner />
        ) : netWorthError ? (
          <ErrorMessage message="Failed to load net worth history." />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={nwh}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className={styles.section}>
        <h2>Recent Transactions</h2>
        {loadingTransactions && !transactionsError ? (
          <Spinner />
        ) : transactionsError ? (
          <ErrorMessage message="Failed to load recent transactions." />
        ) : (
          <TransactionList transactions={txns} />
        )}
      </section>

      <section className={styles.section}>
        <h2>Goals</h2>
        {loadingGoals && !goalsError ? (
          <Spinner />
        ) : goalsError ? (
          <ErrorMessage message="Failed to load goals." />
        ) : (
          <div className={styles.goalsContainer}>
            {goalsList.map((goal) => (
              <GoalProgress key={goal.id} goal={goal} />
            ))}
          </div>
        )}
      </section>

      {!transactionsError && (
        <div className={styles.export}>
          <CSVLink
            data={txns}
            filename={`transactions_${new Date().toISOString().replace(/:/g, '-')}.csv`}
            className={styles.exportButton}
          >
            Export Transactions
          </CSVLink>
        </div>
      )}
    </div>
  )
}

export default Dashboard