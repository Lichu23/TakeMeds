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
      alert('Notifications enabled successfully!');
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
      alert('Notifications disabled');
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
      alert('Test notification sent! Check your notifications.');
    } catch (error) {
      alert('Failed to send test notification. Make sure notifications are enabled.');
    } finally {
      setTestLoading(false);
    }
  };

  const getPermissionBadge = () => {
    switch (notificationPermission) {
      case 'granted':
        return <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">Granted</span>;
      case 'denied':
        return <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs sm:text-sm font-medium">Denied</span>;
      default:
        return <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-medium">Not Set</span>;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Manage your app preferences and notifications
        </p>
      </div>

      {/* Notifications Section */}
      <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Push Notifications</h2>

        {/* Permission Status */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Permission Status</span>
            {getPermissionBadge()}
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            {notificationPermission === 'granted' && 'You will receive medication reminders.'}
            {notificationPermission === 'denied' && 'Notifications are blocked. Enable them in your browser settings.'}
            {notificationPermission === 'default' && 'Click "Enable Notifications" to receive reminders.'}
          </p>
        </div>

        {/* Subscription Status */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Subscription Status</span>
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
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
              className="btn-primary w-full py-3 sm:py-2"
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </button>
          )}

          {isSubscribed && (
            <>
              <button
                onClick={handleTestNotification}
                disabled={testLoading}
                className="btn-secondary w-full py-3 sm:py-2"
              >
                {testLoading ? 'Sending...' : 'Send Test Notification'}
              </button>

              <button
                onClick={handleDisableNotifications}
                disabled={loading}
                className="btn-danger w-full py-3 sm:py-2"
              >
                {loading ? 'Disabling...' : 'Disable Notifications'}
              </button>
            </>
          )}

          {notificationPermission === 'denied' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-red-800">
                <strong>Notifications Blocked</strong>
                <br />
                <span className="mt-1 block">
                  To enable notifications, allow them in your browser settings. Look for the lock icon in the address bar.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* How Notifications Work */}
      <div className="card p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">How Notifications Work</h2>
        <div className="space-y-4 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl">⏰</span>
            <div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">Scheduled Reminders</p>
              <p className="text-xs sm:text-sm">You'll receive a notification at each scheduled medication time.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl">✓</span>
            <div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">Quick Actions</p>
              <p className="text-xs sm:text-sm">Mark medications as taken directly from the notification.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl">🔒</span>
            <div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">Privacy</p>
              <p className="text-xs sm:text-sm">Notifications are sent securely and only to devices you've enabled.</p>
            </div>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">About PillTime</h2>
        <div className="space-y-2 text-xs sm:text-sm text-gray-600">
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Status:</strong> Progressive Web App</p>
          <p><strong>Features:</strong> Medication tracking, Push notifications, Offline support</p>
          <p className="mt-4 pt-4 border-t border-gray-200 text-xs">
            Built with care for better medication adherence
          </p>
        </div>
      </div>
    </div>
  );
}
