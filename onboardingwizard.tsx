import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

const CATEGORIES = [
  'Housing',
  'Food & Dining',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Savings',
  'Debt Repayment',
  'Other',
] as const

const ACCOUNT_TYPES = ['Checking', 'Savings', 'Credit Card', 'Investment', 'Loan'] as const

type Account = {
  id: string
  name: string
  type: (typeof ACCOUNT_TYPES)[number]
}

type SavingsGoal = {
  id: string
  name: string
  amount: number
  targetDate: string
}

export const OnboardingWizard: React.FC = (): JSX.Element => {
  const navigate = useNavigate()
  const [step, setStep] = useState<number>(1)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [newAccountName, setNewAccountName] = useState<string>('')
  const [newAccountType, setNewAccountType] = useState<string>(ACCOUNT_TYPES[0])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [newGoalName, setNewGoalName] = useState<string>('')
  const [newGoalAmount, setNewGoalAmount] = useState<string>('')
  const [newGoalDate, setNewGoalDate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  const addAccount = () => {
    if (!newAccountName.trim()) return
    const account: Account = {
      id: uuidv4(),
      name: newAccountName.trim(),
      type: newAccountType as (typeof ACCOUNT_TYPES)[number],
    }
    setAccounts(prev => [...prev, account])
    setNewAccountName('')
    setNewAccountType(ACCOUNT_TYPES[0])
  }

  const removeAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id))
  }

  const addGoal = () => {
    const amountNum = Number(newGoalAmount)
    if (
      !newGoalName.trim() ||
      !newGoalAmount ||
      isNaN(amountNum) ||
      amountNum <= 0 ||
      !newGoalDate
    ) {
      return
    }
    const goal: SavingsGoal = {
      id: uuidv4(),
      name: newGoalName.trim(),
      amount: amountNum,
      targetDate: newGoalDate,
    }
    setGoals(prev => [...prev, goal])
    setNewGoalName('')
    setNewGoalAmount('')
    setNewGoalDate('')
  }

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const nextStep = () => {
    if (step === 1 && selectedCategories.length === 0) return
    if (step === 2 && accounts.length === 0) return
    if (step === 3 && goals.length === 0) return
    setStep(prev => prev + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    const payload = { categories: selectedCategories, accounts, goals }
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorText = await response.text()
        setError(`Submission failed: ${errorText || response.statusText}`)
        setLoading(false)
        return
      }
      navigate('/dashboard')
    } catch (e) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-wizard container mx-auto p-4 max-w-md">
      <div className="progress mb-4">
        <div className="text-center">Step {step} of 4</div>
        <div className="w-full bg-gray-200 rounded h-2 mt-1">
          <div
            className="bg-blue-500 h-2 rounded"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Select Budget Categories</h2>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <label key={cat} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="form-checkbox"
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Link Your Accounts</h2>
          <div className="space-y-2 mb-4">
            <input
              type="text"
              placeholder="Account Name"
              value={newAccountName}
              onChange={e => setNewAccountName(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <select
              value={newAccountType}
              onChange={e => setNewAccountType(e.target.value)}
              className="w-full border p-2 rounded"
            >
              {ACCOUNT_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addAccount}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Account
            </button>
          </div>
          {accounts.length > 0 && (
            <ul className="list-disc list-inside mb-4">
              {accounts.map(acc => (
                <li key={acc.id} className="flex justify-between">
                  <span>
                    {acc.name} ({acc.type})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAccount(acc.id)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Set Saving Goals</h2>
          <div className="space-y-2 mb-4">
            <input
              type="text"
              placeholder="Goal Name"
              value={newGoalName}
              onChange={e => setNewGoalName(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newGoalAmount}
              onChange={e => setNewGoalAmount(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <input
              type="date"
              value={newGoalDate}
              onChange={e => setNewGoalDate(e.target.value)}
              className="w-full border p-2 rounded"
            />
            <button
              type="button"
              onClick={addGoal}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add Goal
            </button>
          </div>
          {goals.length > 0 && (
            <ul className="list-disc list-inside mb-4">
              {goals.map(g => (
                <li key={g.id} className="flex justify-between">
                  <span>
                    {g.name}: ${g.amount} by {g.targetDate}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeGoal(g.id)}
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Review & Confirm</h2>
          <div className="mb-4">
            <h3 className="font-semibold">Categories:</h3>
            <p>{selectedCategories.join(', ')}</p>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold">Accounts:</h3>
            <ul className="list-disc list-inside">
              {accounts.map(a => (
                <li key={a.id}>
                  {a.name} ({a.type})
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold">Saving Goals:</h3>
            <ul className="list-disc list-inside">
              {goals.map(g => (
                <li key={g.id}>
                  {g.name}: ${g.amount} by {g.targetDate}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="flex justify-between mt-4">
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            disabled={loading}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Back
          </button>
        )}
        {step < 4 && (
          <button
            type="button"
            onClick={nextStep}
            disabled={
              loading ||
              (step === 1 && selectedCategories.length === 0) ||
              (step === 2 && accounts.length === 0) ||
              (step === 3 && goals.length === 0)
            }
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Next
          </button>
        )}
        {step === 4 && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Finish'}
          </button>
        )}
      </div>
    </div>
  )
}