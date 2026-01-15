import { useState, useEffect } from 'react';
import {
  subscribeToPush,
  getNotificationPermission,
  isPushSubscribed,
} from '../utils/pushNotifications';

export function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const currentPermission = getNotificationPermission();
    setPermission(currentPermission);

    const subscribed = await isPushSubscribed();
    setIsSubscribed(subscribed);

    // Show prompt if permission not granted and not dismissed
    const dismissed = localStorage.getItem('notificationPromptDismissed');
    if (currentPermission === 'default' && !subscribed && !dismissed) {
      // Wait a bit before showing to avoid overwhelming user
      setTimeout(() => setShowPrompt(true), 3000);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      await subscribeToPush();
      setIsSubscribed(true);
      setPermission('granted');
      setShowPrompt(false);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      alert('Failed to enable notifications. Please check your browser settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notificationPromptDismissed', Date.now().toString());
  };

  // Don't show if already granted or denied
  if (permission !== 'default' || isSubscribed || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Enable Notifications</h3>
            <p className="mt-1 text-sm text-gray-600">
              Get reminded when it's time to take your medications. We'll send you a notification at your scheduled times.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleEnable}
                disabled={loading}
                className="btn-primary text-sm"
              >
                {loading ? 'Enabling...' : 'Enable Notifications'}
              </button>
              <button
                onClick={handleDismiss}
                disabled={loading}
                className="btn-secondary text-sm"
              >
                Not Now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
