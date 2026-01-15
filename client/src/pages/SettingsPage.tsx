import { useState, useEffect } from 'react';
import {
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
  getNotificationPermission,
  sendTestNotification,
} from '../utils/pushNotifications';

export function SettingsPage() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const permission = getNotificationPermission();
    setNotificationPermission(permission);

    const subscribed = await isPushSubscribed();
    setIsSubscribed(subscribed);
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      await subscribeToPush();
      await checkNotificationStatus();
      alert('✅ Notifications enabled successfully!');
    } catch (error) {
      alert('Failed to enable notifications. Please check your browser settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    if (!confirm('Are you sure you want to disable notifications?')) {
      return;
    }

    setLoading(true);
    try {
      await unsubscribeFromPush();
      await checkNotificationStatus();
      alert('✅ Notifications disabled');
    } catch (error) {
      alert('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setTestLoading(true);
    try {
      await sendTestNotification();
      alert('✅ Test notification sent! Check your notifications.');
    } catch (error) {
      alert('Failed to send test notification. Make sure notifications are enabled.');
    } finally {
      setTestLoading(false);
    }
  };

  const getPermissionBadge = () => {
    switch (notificationPermission) {
      case 'granted':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Granted</span>;
      case 'denied':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Denied</span>;
      default:
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Not Set</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your app preferences and notifications</p>
      </div>

      {/* Notifications Section */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Push Notifications</h2>

        {/* Permission Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Permission Status</span>
            {getPermissionBadge()}
          </div>
          <p className="text-sm text-gray-600">
            {notificationPermission === 'granted' && 'You will receive medication reminders.'}
            {notificationPermission === 'denied' && 'Notifications are blocked. Enable them in your browser settings.'}
            {notificationPermission === 'default' && 'Click "Enable Notifications" to receive reminders.'}
          </p>
        </div>

        {/* Subscription Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Subscription Status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSubscribed
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!isSubscribed && notificationPermission !== 'denied' && (
            <button
              onClick={handleEnableNotifications}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Enabling...' : '🔔 Enable Notifications'}
            </button>
          )}

          {isSubscribed && (
            <>
              <button
                onClick={handleTestNotification}
                disabled={testLoading}
                className="btn-secondary w-full"
              >
                {testLoading ? 'Sending...' : '📨 Send Test Notification'}
              </button>

              <button
                onClick={handleDisableNotifications}
                disabled={loading}
                className="btn-danger w-full"
              >
                {loading ? 'Disabling...' : '🔕 Disable Notifications'}
              </button>
            </>
          )}

          {notificationPermission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Notifications Blocked</strong>
                <br />
                To enable notifications, you need to allow them in your browser settings:
                <br />
                • Chrome/Edge: Click the lock icon in the address bar → Site settings → Notifications → Allow
                <br />
                • Firefox: Click the lock icon → More information → Permissions → Notifications → Allow
                <br />
                • Safari: Safari menu → Settings → Websites → Notifications → Allow
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How Notifications Work */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">How Notifications Work</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="font-medium text-gray-900">Scheduled Reminders</p>
              <p>You'll receive a notification at each scheduled medication time.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-medium text-gray-900">Quick Actions</p>
              <p>Mark medications as taken directly from the notification.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-medium text-gray-900">Privacy</p>
              <p>Notifications are sent securely and only to devices you've enabled.</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About PillTime</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Status:</strong> Progressive Web App</p>
          <p><strong>Features:</strong> Medication tracking, Push notifications, Offline support</p>
          <p className="mt-4 pt-4 border-t border-gray-200 text-xs">
            Built with ❤️ for better medication adherence
          </p>
        </div>
      </div>
    </div>
  );
}
