import { createContext, useContext, useEffect, useState } from "react"
import { getUsers, saveUser } from "../utils/localStorage"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

const getStoredUser = () => {
  const userId = localStorage.getItem("taskboard_current_user")
  return getUsers().find((user) => user.id === userId) || null
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(getStoredUser)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => localStorage.getItem("token"))
  const [authError, setAuthError] = useState(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => setLoading(false), [])

  const login = async (email, password) => {
    const user = getUsers().find((storedUser) =>
      storedUser.email.toLowerCase() === email.toLowerCase() && storedUser.password === password
    )
    if (!user) return { success: false, error: "Invalid email or password." }

    const newToken = `local-${user.id}`
    localStorage.setItem("token", newToken)
    localStorage.setItem("taskboard_current_user", user.id)
    setToken(newToken)
    setCurrentUser(user)
    setAuthError(null)
    return { success: true }
  }

  const register = async (name, email, password) => {
    if (getUsers().some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists." }
    }
    saveUser({
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name,
      email,
      password,
    })
    return { success: true, message: "Registration successful" }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("taskboard_current_user")
    setToken(null)
    setCurrentUser(null)
    setAuthError(null)
    setNotifications([])
  }

  const updateProfile = async (updatedData) => {
    if (!currentUser) return { success: false, error: "No signed-in user." }
    const updatedUser = { ...currentUser, ...updatedData }
    const users = getUsers().map((user) => user.id === currentUser.id ? updatedUser : user)
    localStorage.setItem("taskboard_users", JSON.stringify(users))
    setCurrentUser(updatedUser)
    return { success: true, message: "Profile updated successfully", user: updatedUser }
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
    updateProfile,
    token,
    authError,
    loading,
    socketConnected: false,
    notifications,
    markNotificationAsRead: (notificationId) => setNotifications((items) =>
      items.map((item) => item.id === notificationId ? { ...item, read: true } : item)
    ),
    clearNotifications: () => setNotifications([]),
    getUnreadNotificationsCount: () => notifications.filter((item) => !item.read).length,
    setAuthError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
