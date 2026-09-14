import { useAuth } from "../contexts/AuthContext"
import { useEffect, useState } from "react"

const Notifications = () => {
  const { notifications, markNotificationAsRead, clearNotifications, socketConnected } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setShowNotifications(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notifications])

  const unreadCount = notifications.filter(n => !n.read).length

  if (!showNotifications && unreadCount === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-96">
        {/* Notification Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showNotifications ? '▲' : '▼'}
            </button>
            <button
              onClick={clearNotifications}
              className="text-gray-500 hover:text-red-500 text-sm"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Notification List */}
        {showNotifications && (
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${notif.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                  onClick={() => markNotificationAsRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-2 rounded-full ${notif.read ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{notif.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{notif.message}</div>
                      {notif.task && (
                        <div className="text-xs text-gray-500 mt-2">
                          Task: {notif.task.title}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Notification Bell in Dashboard Header */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </button>
      </div>
    </div>
  )
}

export default Notifications