import React, { useState, useEffect, FormEvent } from 'react'
import { NotificationSettingsData } from '../types'

const NotificationSettings: React.FC = () => {
  const [initialSettings, setInitialSettings] = useState<NotificationSettingsData | null>(null)
  const [form, setForm] = useState<NotificationSettingsData>({
    email: false,
    sms: false,
    push: false,
    marketing: false,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDirty, setDirty] = useState<boolean>(false)

  const fetchSettings = async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/user/notification-settings', {
        credentials: 'include',
        signal,
      })
      if (!res.ok) throw new Error('Failed to load settings.')
      const data: NotificationSettingsData = await res.json()
      setInitialSettings(data)
      setForm(data)
      setDirty(false)
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'An error occurred while loading settings.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchSettings(controller.signal)
    return () => {
      controller.abort()
    }
  }, [])

  const handleToggle = (key: keyof NotificationSettingsData) => {
    if (!initialSettings) return
    setForm(prev => ({ ...prev, [key]: !prev[key] }))
    setDirty(true)
    setSuccess(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!initialSettings) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/user/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save settings.')
      setInitialSettings(form)
      setDirty(false)
      setSuccess('Settings saved successfully.')
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (!initialSettings) return
    setForm(initialSettings)
    setDirty(false)
    setError(null)
    setSuccess(null)
  }

  if (loading) {
    return (
      <div className="notification-settings__loading" role="status" aria-live="polite">
        Loading notification settings...
      </div>
    )
  }

  if (!initialSettings) {
    return (
      <div className="notification-settings__message notification-settings__message--error" role="alert">
        {error || 'Unable to load notification settings.'}
      </div>
    )
  }

  return (
    <form className="notification-settings" onSubmit={handleSubmit}>
      <h2 className="notification-settings__title">Notification Settings</h2>

      {error && (
        <div className="notification-settings__message notification-settings__message--error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="notification-settings__message notification-settings__message--success" role="alert">
          {success}
        </div>
      )}

      <div className="notification-settings__item">
        <label>
          <input
            type="checkbox"
            checked={form.email}
            onChange={() => handleToggle('email')}
            disabled={saving}
          />
          Email Notifications
        </label>
      </div>

      <div className="notification-settings__item">
        <label>
          <input
            type="checkbox"
            checked={form.sms}
            onChange={() => handleToggle('sms')}
            disabled={saving}
          />
          SMS Notifications
        </label>
      </div>

      <div className="notification-settings__item">
        <label>
          <input
            type="checkbox"
            checked={form.push}
            onChange={() => handleToggle('push')}
            disabled={saving}
          />
          Push Notifications
        </label>
      </div>

      <div className="notification-settings__item">
        <label>
          <input
            type="checkbox"
            checked={form.marketing}
            onChange={() => handleToggle('marketing')}
            disabled={saving}
          />
          Marketing Emails
        </label>
      </div>

      <div className="notification-settings__actions">
        <button
          type="submit"
          className="notification-settings__button notification-settings__button--primary"
          disabled={saving || !isDirty}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          className="notification-settings__button notification-settings__button--secondary"
          onClick={handleReset}
          disabled={saving || !isDirty}
        >
          Reset
        </button>
      </div>
    </form>
  )
}

export default NotificationSettings