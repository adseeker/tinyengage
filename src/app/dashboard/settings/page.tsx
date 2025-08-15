'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { TrackingSettings, NotificationSettings } from '@/types'
import { 
  isValidFacebookPixelId, 
  isValidGTMContainerId, 
  isValidGA4MeasurementId, 
  isValidGoogleAdsConversionId 
} from '@/lib/tracking'

export default function SettingsPage() {
  const { accessToken, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Tracking settings state
  const [facebookPixelId, setFacebookPixelId] = useState('')
  const [gtmContainerId, setGtmContainerId] = useState('')
  const [ga4MeasurementId, setGa4MeasurementId] = useState('')
  const [googleAdsConversionId, setGoogleAdsConversionId] = useState('')
  const [googleAdsConversionLabel, setGoogleAdsConversionLabel] = useState('')

  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [webhookNotifications, setWebhookNotifications] = useState(false)

  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (accessToken) {
      fetchSettings()
    }
  }, [accessToken])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Set tracking settings
        if (data.trackingSettings) {
          setFacebookPixelId(data.trackingSettings.facebookPixelId || '')
          setGtmContainerId(data.trackingSettings.gtmContainerId || '')
          setGa4MeasurementId(data.trackingSettings.ga4MeasurementId || '')
          setGoogleAdsConversionId(data.trackingSettings.googleAdsConversionId || '')
          setGoogleAdsConversionLabel(data.trackingSettings.googleAdsConversionLabel || '')
        }

        // Set notification settings
        if (data.notificationSettings) {
          setEmailNotifications(data.notificationSettings.emailNotifications)
          setWebhookNotifications(data.notificationSettings.webhookNotifications)
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const validateFields = () => {
    const errors: Record<string, string> = {}

    if (facebookPixelId && !isValidFacebookPixelId(facebookPixelId)) {
      errors.facebookPixelId = 'Invalid Facebook Pixel ID format'
    }

    if (gtmContainerId && !isValidGTMContainerId(gtmContainerId)) {
      errors.gtmContainerId = 'Invalid GTM Container ID format (GTM-XXXXXXX)'
    }

    if (ga4MeasurementId && !isValidGA4MeasurementId(ga4MeasurementId)) {
      errors.ga4MeasurementId = 'Invalid GA4 Measurement ID format (G-XXXXXXXXXX)'
    }

    if (googleAdsConversionId && !isValidGoogleAdsConversionId(googleAdsConversionId)) {
      errors.googleAdsConversionId = 'Invalid Google Ads Conversion ID format (AW-XXXXXXXXXX)'
    }

    if (googleAdsConversionId && !googleAdsConversionLabel) {
      errors.googleAdsConversionLabel = 'Conversion label is required when using Google Ads'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateFields()) {
      return
    }

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const trackingSettings: TrackingSettings = {
        ...(facebookPixelId.trim() && { facebookPixelId: facebookPixelId.trim() }),
        ...(gtmContainerId.trim() && { gtmContainerId: gtmContainerId.trim() }),
        ...(ga4MeasurementId.trim() && { ga4MeasurementId: ga4MeasurementId.trim() }),
        ...(googleAdsConversionId.trim() && { googleAdsConversionId: googleAdsConversionId.trim() }),
        ...(googleAdsConversionLabel.trim() && { googleAdsConversionLabel: googleAdsConversionLabel.trim() })
      }

      const notificationSettings: NotificationSettings = {
        emailNotifications,
        webhookNotifications
      }

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trackingSettings,
          notificationSettings
        })
      })

      if (response.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="heading-xl mb-4">
          Account <span className="text-gradient">Settings</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Configure your tracking and notification preferences. These settings apply to all your surveys.
        </p>
      </div>

      {/* Tracking Settings */}
      <div className="card-modern">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-accent-orange rounded-2xl flex items-center justify-center mr-4">
            <span className="text-lg">📊</span>
          </div>
          <div>
            <h2 className="heading-md">Tracking & Analytics</h2>
            <p className="text-muted-foreground">Add tracking pixels to measure conversions across all your surveys</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Facebook Pixel */}
          <div className="space-y-2">
            <label htmlFor="facebookPixelId" className="text-sm font-medium flex items-center space-x-2">
              <span className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-xs text-white font-bold">f</span>
              <span>Facebook Pixel ID</span>
            </label>
            <Input
              id="facebookPixelId"
              value={facebookPixelId}
              onChange={(e) => setFacebookPixelId(e.target.value)}
              placeholder="487547170517547"
              className={`font-mono h-12 rounded-xl border-2 transition-colors ${
                validationErrors.facebookPixelId ? 'border-destructive' : 'border-border focus:border-primary/50'
              }`}
            />
            {validationErrors.facebookPixelId ? (
              <p className="text-xs text-destructive">{validationErrors.facebookPixelId}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Numbers only (e.g., 487547170517547)</p>
            )}
          </div>

          {/* Google Tag Manager */}
          <div className="space-y-2">
            <label htmlFor="gtmContainerId" className="text-sm font-medium flex items-center space-x-2">
              <span className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center text-xs text-white font-bold">G</span>
              <span>Google Tag Manager</span>
            </label>
            <Input
              id="gtmContainerId"
              value={gtmContainerId}
              onChange={(e) => setGtmContainerId(e.target.value)}
              placeholder="GTM-XXXXXXX"
              className={`font-mono h-12 rounded-xl border-2 transition-colors ${
                validationErrors.gtmContainerId ? 'border-destructive' : 'border-border focus:border-primary/50'
              }`}
            />
            {validationErrors.gtmContainerId ? (
              <p className="text-xs text-destructive">{validationErrors.gtmContainerId}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Container ID (e.g., GTM-XXXXXXX)</p>
            )}
          </div>

          {/* Google Analytics 4 */}
          <div className="space-y-2">
            <label htmlFor="ga4MeasurementId" className="text-sm font-medium flex items-center space-x-2">
              <span className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-xs text-white font-bold">GA</span>
              <span>Google Analytics 4</span>
            </label>
            <Input
              id="ga4MeasurementId"
              value={ga4MeasurementId}
              onChange={(e) => setGa4MeasurementId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className={`font-mono h-12 rounded-xl border-2 transition-colors ${
                validationErrors.ga4MeasurementId ? 'border-destructive' : 'border-border focus:border-primary/50'
              }`}
            />
            {validationErrors.ga4MeasurementId ? (
              <p className="text-xs text-destructive">{validationErrors.ga4MeasurementId}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Measurement ID (e.g., G-XXXXXXXXXX)</p>
            )}
          </div>

          {/* Google Ads - spans both columns */}
          <div className="md:col-span-2 space-y-4 border-t border-border/50 pt-4">
            <label className="text-sm font-medium flex items-center space-x-2">
              <span className="w-5 h-5 bg-red-500 rounded flex items-center justify-center text-xs text-white font-bold">Ad</span>
              <span>Google Ads Conversion</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="googleAdsConversionId" className="text-xs font-medium text-muted-foreground">
                  Conversion ID
                </label>
                <Input
                  id="googleAdsConversionId"
                  value={googleAdsConversionId}
                  onChange={(e) => setGoogleAdsConversionId(e.target.value)}
                  placeholder="AW-XXXXXXXXXX"
                  className={`font-mono h-12 rounded-xl border-2 transition-colors ${
                    validationErrors.googleAdsConversionId ? 'border-destructive' : 'border-border focus:border-primary/50'
                  }`}
                />
                {validationErrors.googleAdsConversionId && (
                  <p className="text-xs text-destructive">{validationErrors.googleAdsConversionId}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="googleAdsConversionLabel" className="text-xs font-medium text-muted-foreground">
                  Conversion Label
                </label>
                <Input
                  id="googleAdsConversionLabel"
                  value={googleAdsConversionLabel}
                  onChange={(e) => setGoogleAdsConversionLabel(e.target.value)}
                  placeholder="abcDEF123_GhIJ"
                  className={`font-mono h-12 rounded-xl border-2 transition-colors ${
                    validationErrors.googleAdsConversionLabel ? 'border-destructive' : 'border-border focus:border-primary/50'
                  }`}
                />
                {validationErrors.googleAdsConversionLabel && (
                  <p className="text-xs text-destructive">{validationErrors.googleAdsConversionLabel}</p>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Both fields required for Google Ads conversion tracking
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card-modern">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-accent-blue rounded-2xl flex items-center justify-center mr-4">
            <span className="text-lg">🔔</span>
          </div>
          <div>
            <h2 className="heading-md">Notifications</h2>
            <p className="text-muted-foreground">Choose how you want to be notified about survey responses</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">Get email alerts when you receive new survey responses</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Webhook Notifications</h3>
              <p className="text-sm text-muted-foreground">Send real-time notifications to your webhook endpoints</p>
            </div>
            <Switch
              checked={webhookNotifications}
              onCheckedChange={setWebhookNotifications}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-8 border-t border-border">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary px-8 py-3"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <>
                <span className="mr-2">💾</span>
                Save Settings
              </>
            )}
          </Button>

          {saveSuccess && (
            <div className="flex items-center space-x-2 text-success">
              <span className="text-lg">✅</span>
              <span className="font-medium">Settings saved successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}