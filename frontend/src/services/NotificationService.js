// Push Notification Service
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

class NotificationService {
  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  static async subscribeToPush() {
    const registration = await this.registerServiceWorker();
    if (!registration) return null;

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  static urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  static async showLocalNotification(title, options = {}) {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return false;

    const registration = await navigator.serviceWorker.ready;
    
    const defaultOptions = {
      body: 'Time to record your dreams!',
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: 'dream-reminder',
      vibrate: [100, 50, 100],
      data: { url: '/dreams/new' },
      actions: [
        { action: 'record', title: 'Record Dream' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };

    await registration.showNotification(title, { ...defaultOptions, ...options });
    return true;
  }

  static async scheduleReminder(time) {
    // Store reminder time in localStorage
    localStorage.setItem('dreamReminderTime', time);
    
    // Check and show notification based on time
    this.checkAndShowReminder(time);
  }

  static checkAndShowReminder(reminderTime) {
    const now = new Date();
    const [hours, minutes] = reminderTime.split(':').map(Number);
    
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);
    
    // If reminder time has passed today, schedule for tomorrow
    if (reminderDate <= now) {
      reminderDate.setDate(reminderDate.getDate() + 1);
    }
    
    const delay = reminderDate.getTime() - now.getTime();
    
    // Schedule the notification
    setTimeout(() => {
      this.showLocalNotification('Dream Journal Reminder', {
        body: '🌙 Good morning! Take a moment to record your dreams before they fade away.',
        tag: 'morning-reminder'
      });
      
      // Reschedule for next day
      this.checkAndShowReminder(reminderTime);
    }, delay);
    
    console.log(`Reminder scheduled for ${reminderDate.toLocaleString()}`);
  }

  static getPermissionStatus() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  }
}

export default NotificationService;
