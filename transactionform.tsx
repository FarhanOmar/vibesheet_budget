import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'react-toastify'

const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
})
type Category = z.infer<typeof CategorySchema>

const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
})
type Account = z.infer<typeof AccountSchema>

const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  type: z.enum(['expense', 'income']),
  amount: z.number(),
  categoryId: z.string(),
  accountId: z.string(),
  payee: z.string(),
  description: z.string(),
})
type Transaction = z.infer<typeof TransactionSchema>

const TransactionFormSchema = TransactionSchema.omit({ id: true })
type FormValues = z.infer<typeof TransactionFormSchema>

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch('/api/categories')
  if (!res.ok) throw new Error('Failed to fetch categories')
  const data = await res.json()
  return z.array(CategorySchema).parse(data)
}

const fetchAccounts = async (): Promise<Account[]> => {
  const res = await fetch('/api/accounts')
  if (!res.ok) throw new Error('Failed to fetch accounts')
  const data = await res.json()
  return z.array(AccountSchema).parse(data)
}

const fetchTransaction = async (id: string): Promise<Transaction> => {
  const res = await fetch(`/api/transactions/${id}`)
  if (!res.ok) throw new Error('Failed to fetch transaction')
  const data = await res.json()
  return TransactionSchema.parse(data)
}

const createTransaction = async (data: FormValues): Promise<void> => {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(err.message || 'Failed to create transaction')
  }
}

const updateTransaction = async ({
  id,
  data,
}: {
  id: string
  data: FormValues
}): Promise<void> => {
  const res = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(err.message || 'Failed to update transaction')
  }
}

interface TransactionFormProps {
  transactionId?: string
}

export default function TransactionForm({ transactionId }: TransactionFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: categories,
    isLoading: catLoading,
    error: catError,
    refetch: refetchCategories,
  } = useQuery(['categories'], fetchCategories)

  const {
    data: accounts,
    isLoading: accLoading,
    error: accError,
    refetch: refetchAccounts,
  } = useQuery(['accounts'], fetchAccounts)

  const {
    data: transaction,
    isLoading: txLoading,
    error: txError,
    refetch: refetchTransaction,
  } = useQuery(['transaction', transactionId], () => fetchTransaction(transactionId!), {
    enabled: !!transactionId,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      type: 'expense',
      amount: 0,
      categoryId: '',
      accountId: '',
      payee: '',
      description: '',
    },
  })

  useEffect(() => {
    if (transaction) {
      reset({
        date: transaction.date.slice(0, 10),
        type: transaction.type,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
        accountId: transaction.accountId,
        payee: transaction.payee,
        description: transaction.description,
      })
    }
  }, [transaction, reset])

  const createMutation = useMutation(createTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions'])
      toast.success('Transaction created')
      navigate('/transactions')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error creating transaction')
    },
  })

  const updateMutation = useMutation(updateTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions'])
      toast.success('Transaction updated')
      navigate('/transactions')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error updating transaction')
    },
  })

  const onSubmit = async (data: FormValues) => {
    if (transactionId) {
      await updateMutation.mutateAsync({ id: transactionId, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  if (catLoading || accLoading || txLoading) {
    return <div>Loading...</div>
  }

  if (catError || accError || txError) {
    return (
      <div>
        {catError && (
          <div>
            Error loading categories: {(catError as Error).message}{' '}
            <button onClick={() => refetchCategories()}>Retry</button>
          </div>
        )}
        {accError && (
          <div>
            Error loading accounts: {(accError as Error).message}{' '}
            <button onClick={() => refetchAccounts()}>Retry</button>
          </div>
        )}
        {transactionId && txError && (
          <div>
            Error loading transaction: {(txError as Error).message}{' '}
            <button onClick={() => refetchTransaction()}>Retry</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="transaction-form">
      <div className="form-group">
        <label htmlFor="date">Date</label>
        <input id="date" type="date" {...register('date', { required: 'Date is required' })} />
        {errors.date && <span className="error">{errors.date.message}</span>}
      </div>

      <div className="form-group">
        <label>Type</label>
        <div className="form-options">
          <label>
            <input type="radio" value="expense" {...register('type', { required: true })} />
            Expense
          </label>
          <label>
            <input type="radio" value="income" {...register('type', { required: true })} />
            Income
          </label>
        </div>
        {errors.type && <span className="error">Type is required</span>}
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount', {
            required: 'Amount is required',
            valueAsNumber: true,
            min: { value: 0.01, message: 'Amount must be positive' },
          })}
        />
        {errors.amount && <span className="error">{errors.amount.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="categoryId">Category</label>
        <select id="categoryId" {...register('categoryId', { required: 'Category is required' })}>
          <option value="">Select category</option>
          {categories!.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <span className="error">{errors.categoryId.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="accountId">Account</label>
        <select id="accountId" {...register('accountId', { required: 'Account is required' })}>
          <option value="">Select account</option>
          {accounts!.map(acc => (
            <option key={acc.id} value={acc.id}>
              {acc.name}
            </option>
          ))}
        </select>
        {errors.accountId && <span className="error">{errors.accountId.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="payee">Payee</label>
        <input
          id="payee"
          type="text"
          {...register('payee', { maxLength: { value: 100, message: 'Max 100 characters' } })}
        />
        {errors.payee && <span className="error">{errors.payee.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          {...register('description', { maxLength: { value: 500, message: 'Max 500 characters' } })}
        />
        {errors.description && <span className="error">{errors.description.message}</span>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || createMutation.isLoading || updateMutation.isLoading}
      >
        {transactionId ? 'Update Transaction' : 'Create Transaction'}
      </button>
    </form>
  )
}