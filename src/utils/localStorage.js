const USERS_KEY = "taskboard_users"
const TASKS_KEY = "taskboard_tasks"

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))

export const getUsers = () => read(USERS_KEY, [])
export const saveUser = (user) => {
  const users = [...getUsers(), user]
  write(USERS_KEY, users)
  return user
}
export const getTasks = () => read(TASKS_KEY, [])
export const saveTasks = (tasks) => {
  write(TASKS_KEY, tasks)
  return tasks
}
export const createTask = (taskData, user) => {
  const task = {
    ...taskData,
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    created_by_id: user.id,
    created_by_name: user.name,
    assigned_to_name: taskData.assigned_to_id === user.id ? user.name : "",
    createdAt: new Date().toISOString(),
  }
  saveTasks([...getTasks(), task])
  return task
}
export const updateTask = (taskId, changes) => {
  const tasks = getTasks().map((task) => task.id === taskId ? { ...task, ...changes } : task)
  saveTasks(tasks)
  return tasks.find((task) => task.id === taskId)
}
export const deleteTask = (taskId) => {
  const tasks = getTasks().filter((task) => task.id !== taskId)
  saveTasks(tasks)
  return tasks
}
