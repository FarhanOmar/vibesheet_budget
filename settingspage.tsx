import React, { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types';

const availableLanguages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espa?ol' },
  { code: 'fr', label: 'Fran?ais' }
];

const availableCurrencies = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '?' },
  { code: 'GBP', symbol: '?' }
];

export default function SettingsPage(): JSX.Element {
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    language: 'en',
    notifications: true,
    currency: 'USD'
  });
  const [initialSettings, setInitialSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const data: Settings = await res.json();
      setSettings(data);
      setInitialSettings(data);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value, checked } = e.target;
    setSuccess(null);
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const hasChanges = (): boolean => {
    return (
      initialSettings !== null &&
      (initialSettings.theme !== settings.theme ||
        initialSettings.language !== settings.language ||
        initialSettings.notifications !== settings.notifications ||
        initialSettings.currency !== settings.currency)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges()) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save settings');
      const updated: Settings = await res.json();
      setSettings(updated);
      setInitialSettings(updated);
      setSuccess('Settings saved successfully.');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-page">Loading settings...</div>;
  }

  if (!loading && initialSettings === null) {
    return (
      <div className="settings-page">
        <h1>Settings</h1>
        <div className="settings-error">{error}</div>
        <button onClick={fetchSettings}>Retry</button>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <form onSubmit={handleSubmit}>
        <section className="settings-section">
          <h2>Appearance</h2>
          <label>
            Theme
            <select name="theme" value={settings.theme} onChange={handleChange}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>
        </section>

        <section className="settings-section">
          <h2>Language & Currency</h2>
          <label>
            Language
            <select name="language" value={settings.language} onChange={handleChange}>
              {availableLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Currency
            <select name="currency" value={settings.currency} onChange={handleChange}>
              {availableCurrencies.map(cur => (
                <option key={cur.code} value={cur.code}>
                  {cur.code} ({cur.symbol})
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="settings-section">
          <h2>Notifications</h2>
          <label>
            <input
              type="checkbox"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
            />
            Enable Notifications
          </label>
        </section>

        {error && initialSettings !== null && (
          <div className="settings-error">{error}</div>
        )}
        {success && <div className="settings-success">{success}</div>}

        <button type="submit" disabled={!hasChanges() || saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}