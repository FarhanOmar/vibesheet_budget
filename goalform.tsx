import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { fetchGoal, createGoal, updateGoal } from '../services/goalService'

type FormValues = {
  name: string
  amount: string
  targetDate: string
}

type GoalFormData = {
  name: string
  amount: number
  targetDate: string
}

type GoalFormProps = {
  goalId?: string
}

const GoalForm: React.FC<GoalFormProps> = ({ goalId }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      amount: '',
      targetDate: ''
    }
  })

  const { data: goal, isLoading: isLoadingGoal } = useQuery(
    ['goal', goalId],
    () => fetchGoal(goalId!),
    {
      enabled: Boolean(goalId),
      onSuccess: data => {
        reset({
          name: data.name,
          amount: data.amount.toString(),
          targetDate: data.targetDate.split('T')[0]
        })
        setFormError(null)
      }
    }
  )

  const createMutation = useMutation(
    (data: GoalFormData) => createGoal(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['goals'])
        setFormError(null)
        navigate('/goals')
      },
      onError: (error: any) => {
        const message =
          error?.message || 'An error occurred creating the goal.'
        setFormError(message)
      }
    }
  )

  const updateMutation = useMutation(
    (data: GoalFormData) => updateGoal(goalId!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['goals'])
        setFormError(null)
        navigate('/goals')
      },
      onError: (error: any) => {
        const message =
          error?.message || 'An error occurred updating the goal.'
        setFormError(message)
      }
    }
  )

  const onSubmit = (data: FormValues) => {
    setFormError(null)
    const parsedAmount = parseFloat(data.amount)
    const payload: GoalFormData = {
      name: data.name,
      amount: parsedAmount,
      targetDate: data.targetDate
    }
    if (goalId) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  useEffect(() => {
    if (!goalId) {
      reset({
        name: '',
        amount: '',
        targetDate: ''
      })
      setFormError(null)
    }
  }, [goalId, reset])

  if (isLoadingGoal) {
    return <div className="p-4 text-center">Loading goal...</div>
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">
        {goalId ? 'Edit Goal' : 'New Goal'}
      </h2>
      {formError && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {formError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 font-medium">
            Goal Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="amount" className="block mb-1 font-medium">
            Target Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            {...register('amount', {
              required: 'Amount is required',
              validate: value => {
                const number = parseFloat(value)
                if (isNaN(number)) return 'Amount must be a number'
                if (number <= 0) return 'Must be greater than 0'
                return true
              }
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.amount && (
            <p className="text-sm text-red-600 mt-1">
              {errors.amount.message}
            </p>
          )}
        </div>
        <div className="mb-6">
          <label htmlFor="targetDate" className="block mb-1 font-medium">
            Target Date
          </label>
          <input
            id="targetDate"
            type="date"
            {...register('targetDate', { required: 'Date is required' })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.targetDate && (
            <p className="text-sm text-red-600 mt-1">
              {errors.targetDate.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/goals')}
            className="px-4 py-2 text-gray-700 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting ||
              createMutation.isLoading ||
              updateMutation.isLoading
            }
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {goalId ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default GoalForm