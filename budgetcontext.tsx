import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  ReactNode,
} from 'react'

export type Budget = {
  id: string
  name: string
  limit: number
  spent: number
}

export type BudgetInput = {
  name: string
  limit: number
}

export enum ActionType {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  RESET = 'RESET',
}

type AddAction = {
  type: ActionType.ADD
  payload: Budget
}

type UpdateAction = {
  type: ActionType.UPDATE
  payload: { id: string; updates: Partial<BudgetInput> & { spent?: number } }
}

type DeleteAction = {
  type: ActionType.DELETE
  payload: { id: string }
}

type ResetAction = {
  type: ActionType.RESET
}

type Action = AddAction | UpdateAction | DeleteAction | ResetAction

function budgetReducer(state: Budget[], action: Action): Budget[] {
  switch (action.type) {
    case ActionType.ADD:
      return [...state, action.payload]
    case ActionType.UPDATE:
      return state.map(b =>
        b.id === action.payload.id ? { ...b, ...action.payload.updates } : b
      )
    case ActionType.DELETE:
      return state.filter(b => b.id !== action.payload.id)
    case ActionType.RESET:
      return []
    default:
      return state
  }
}

type BudgetContextType = {
  budgets: Budget[]
  createBudget: (input: BudgetInput) => void
  updateBudget: (id: string, updates: Partial<BudgetInput> & { spent?: number }) => void
  deleteBudget: (id: string) => void
  resetBudgets: () => void
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)
BudgetContext.displayName = 'BudgetContext'

export function BudgetProvider({ children }: { children: ReactNode }): JSX.Element {
  const [budgets, dispatch] = useReducer(
    budgetReducer,
    [],
    initial => {
      if (typeof window === 'undefined') {
        return initial
      }
      try {
        const stored = window.localStorage.getItem('budgets')
        return stored ? (JSON.parse(stored) as Budget[]) : initial
      } catch (error) {
        console.error('Failed to load budgets from localStorage:', error)
        return initial
      }
    }
  )

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem('budgets', JSON.stringify(budgets))
    } catch (error) {
      console.error('Failed to save budgets to localStorage:', error)
    }
  }, [budgets])

  const createBudget = useCallback((input: BudgetInput) => {
    let id: string
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      try {
        id = window.crypto.randomUUID()
      } catch {
        id = Math.random().toString(36).slice(2)
      }
    } else {
      id = Math.random().toString(36).slice(2)
    }
    const newBudget: Budget = { id, name: input.name, limit: input.limit, spent: 0 }
    dispatch({ type: ActionType.ADD, payload: newBudget })
  }, [])

  const updateBudget = useCallback(
    (id: string, updates: Partial<BudgetInput> & { spent?: number }) => {
      dispatch({ type: ActionType.UPDATE, payload: { id, updates } })
    },
    []
  )

  const deleteBudget = useCallback((id: string) => {
    dispatch({ type: ActionType.DELETE, payload: { id } })
  }, [])

  const resetBudgets = useCallback(() => {
    dispatch({ type: ActionType.RESET })
  }, [])

  const value = useMemo<BudgetContextType>(
    () => ({
      budgets,
      createBudget,
      updateBudget,
      deleteBudget,
      resetBudgets,
    }),
    [budgets, createBudget, updateBudget, deleteBudget, resetBudgets]
  )

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}

export function useBudget(): BudgetContextType {
  const context = useContext(BudgetContext)
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider')
  }
  return context
}