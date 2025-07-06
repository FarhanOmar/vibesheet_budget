import React, { useContext, useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react'
import { AuthContext } from './authcontext'
import { getUserProfile, updateUserProfile } from '../services/userService'
import type { UserProfile } from '../types/UserProfile'

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
]

const timezoneOptions = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Australia/Sydney',
]

const ProfilePage: React.FC = () => {
  const { setUser, logout } = useContext(AuthContext)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getUserProfile()
      setProfile(data)
      setFormData(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setError('')
    try {
      const updated = await updateUserProfile(formData as UserProfile)
      setProfile(updated)
      setUser(prev => ({ ...prev, ...updated }))
    } catch (err) {
      console.error(err)
      setError('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <h1 className="profile-page__title">My Profile</h1>
        <p className="profile-page__loading">Loading...</p>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="profile-page">
        <h1 className="profile-page__title">My Profile</h1>
        <div role="alert" className="profile-page__error">
          {error}
        </div>
        <button
          type="button"
          className="profile-page__button"
          onClick={fetchProfile}
        >
          Retry
        </button>
        <button
          type="button"
          className="profile-page__logout"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <h1 className="profile-page__title">My Profile</h1>
      <form onSubmit={handleSubmit} className="profile-page__form">
        {error && (
          <div role="alert" className="profile-page__error">
            {error}
          </div>
        )}
        <div className="profile-page__group">
          <label htmlFor="name" className="profile-page__label">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="profile-page__input"
            value={formData.name || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="profile-page__group">
          <label htmlFor="email" className="profile-page__label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="profile-page__input"
            value={formData.email || ''}
            onChange={handleChange}
            required
          />
        </div>
        <div className="profile-page__group">
          <label htmlFor="currencyPreference" className="profile-page__label">
            Currency Preference
          </label>
          <select
            id="currencyPreference"
            name="currencyPreference"
            className="profile-page__select"
            value={formData.currencyPreference || ''}
            onChange={handleChange}
          >
            <option value="">Select...</option>
            {currencyOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="profile-page__group">
          <label htmlFor="timezone" className="profile-page__label">
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            className="profile-page__select"
            value={formData.timezone || ''}
            onChange={handleChange}
          >
            <option value="">Select...</option>
            {timezoneOptions.map(tz => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="profile-page__button"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      <button
        type="button"
        className="profile-page__logout"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  )
}

export default ProfilePage