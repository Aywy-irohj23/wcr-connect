import { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, X, Clock } from "lucide-react";

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  urgent: boolean;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Simulate notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Pilne wezwanie',
        message: 'Nowe pilne wezwanie dla grupy AR - wymaga natychmiastowej odpowiedzi',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        urgent: true
      },
      {
        id: '2',
        type: 'success',
        title: 'Potwierdzenie obecności',
        message: 'Jan Kowalski potwierdził obecność na ćwiczeniach planowych',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        urgent: false
      },
      {
        id: '3',
        type: 'info',
        title: 'Nowa wiadomość',
        message: 'Otrzymano nową wiadomość od WCR',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true,
        urgent: false
      },
      {
        id: '4',
        type: 'error',
        title: 'Błąd systemu',
        message: 'Wystąpił problem z synchronizacją danych',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        read: true,
        urgent: false
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const getNotificationIcon = (type: string, urgent: boolean) => {
    if (urgent) return AlertTriangle;
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Info;
    }
  };

  const getNotificationColor = (type: string, urgent: boolean) => {
    if (urgent) return 'text-red-600 bg-red-50 border-red-200';
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes} min temu`;
    if (hours < 24) return `${hours} godz. temu`;
    return `${days} dni temu`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Powiadomienia</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Oznacz wszystkie jako przeczytane
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Brak powiadomień</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type, notification.urgent);
                const colorClass = getNotificationColor(notification.type, notification.urgent);
                
                return (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg border ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.urgent && (
                          <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            Pilne
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 transition-colors">
              Zobacz wszystkie powiadomienia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


