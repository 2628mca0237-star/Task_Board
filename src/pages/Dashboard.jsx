import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import TaskForm from "../components/TaskForm"
import TaskItem from "../components/TaskItem"
import { createTask, deleteTask, getTasks, updateTask } from "../utils/localStorage"

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [assignedTasks, setAssignedTasks] = useState([])
  const [createdTasks, setCreatedTasks] = useState([])
  const [overdueTasks, setOverdueTasks] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    created: 0,
    overdue: 0
  })
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [view, setView] = useState("dashboard") // 'dashboard', 'assigned', 'created', 'overdue'

  const { currentUser, logout, authError } = useAuth()


  // Fetch all dashboard data
  const fetchDashboardData = useCallback(() => {
    const allTasks = getTasks()
    const assigned = allTasks.filter((task) => task.assigned_to_id === currentUser?.id)
    const created = allTasks.filter((task) => task.created_by_id === currentUser?.id)
    const overdue = allTasks.filter((task) => task.due_date && new Date(task.due_date) < new Date() && task.status !== "Completed")
    setTasks(allTasks)
    setAssignedTasks(assigned)
    setCreatedTasks(created)
    setOverdueTasks(overdue)
    setStats({ total: allTasks.length, assigned: assigned.length, created: created.length, overdue: overdue.length })
    setLoading(false)
  }, [currentUser?.id])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Function to add a new task
  const handleAddTask = (taskData) => {
      createTask({
        title: taskData.title,
        description: taskData.description || "",
        due_date: taskData.due_date || null,
        priority: taskData.priority || "Medium",
        status: taskData.status || "To Do",
        assigned_to_id: taskData.assigned_to_id || null
      }, currentUser)
      fetchDashboardData()
      setShowTaskForm(false);
  };

  const handleUpdateTask = (taskId, updatedData) => {
    updateTask(taskId, updatedData)
    fetchDashboardData()
  };

  // Function to delete a task
  const handleDeleteTask = (taskId) => {
    if (!taskId) {
      alert("Error: Cannot delete task - ID is missing");
      return;
    }

    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId)
      fetchDashboardData()
    }
  };


  const handleAssignTask = (taskId, assigneeId) => {
    updateTask(taskId, { assigned_to_id: assigneeId })
    fetchDashboardData()
  };

  // Filter tasks based on selected filter and view
  const getTasksForView = () => {
    switch(view) {
      case 'assigned':
        return assignedTasks;
      case 'created':
        return createdTasks;
      case 'overdue':
        return overdueTasks;
      default:
        return tasks;
    }
  };

  const currentTasks = getTasksForView();
  
  const filteredTasks = currentTasks.filter((task) => {
    if (filter === "All") return true;
    if (filter === "Done") {
      return task.status === "Completed";
    }
    return task.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Connection Status Indicator */}
      <div className="bg-green-100 border-green-500 border-b px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
            <span className="text-sm font-medium">
              Local browser storage active
            </span>
          </div>
          <span className="text-xs text-gray-600">
            Changes are saved on this device
          </span>
        </div>
      </div>

      {authError && authError.includes("Server error") && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{authError} Some features may not work properly.</p>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
              <p className="text-gray-600 mt-1">Welcome back, {currentUser?.name || currentUser?.email || "User"}!</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="text-purple-600 hover:text-purple-700 font-medium px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <h3 className="text-3xl font-bold text-purple-600 mb-2">{stats.total}</h3>
            <p className="text-gray-600 font-medium">Total Tasks</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <h3 className="text-3xl font-bold text-blue-600 mb-2">{stats.assigned}</h3>
            <p className="text-gray-600 font-medium">Assigned to Me</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <h3 className="text-3xl font-bold text-green-600 mb-2">{stats.created}</h3>
            <p className="text-gray-600 font-medium">Created by Me</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <h3 className="text-3xl font-bold text-red-600 mb-2">{stats.overdue}</h3>
            <p className="text-gray-600 font-medium">Overdue</p>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setView("dashboard")}
            className={`px-4 py-2 rounded-lg font-medium ${view === "dashboard" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView("assigned")}
            className={`px-4 py-2 rounded-lg font-medium ${view === "assigned" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Assigned to Me ({assignedTasks.length})
          </button>
          <button
            onClick={() => setView("created")}
            className={`px-4 py-2 rounded-lg font-medium ${view === "created" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Created by Me ({createdTasks.length})
          </button>
          <button
            onClick={() => setView("overdue")}
            className={`px-4 py-2 rounded-lg font-medium ${view === "overdue" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Overdue ({overdueTasks.length})
          </button>
        </div>

        {/* Filter and Add Task button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <label className="font-medium text-gray-700">Filter by status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 bg-white"
            >
              <option value="All">All Tasks</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <button
            onClick={() => setShowTaskForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2"
          >
            <span>+ Add New Task</span>
          </button>
        </div>

        {/* Task list with view description */}
        <div className="mb-8">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {view === "dashboard" && "All Tasks"}
              {view === "assigned" && "Tasks Assigned to You"}
              {view === "created" && "Tasks Created by You"}
              {view === "overdue" && "Overdue Tasks"}
            </h3>
            <p className="text-gray-600">
              {view === "dashboard" && "All tasks assigned to you or created by you"}
              {view === "assigned" && "Tasks that have been assigned to you"}
              {view === "created" && "Tasks that you have created"}
              {view === "overdue" && "Tasks that are past their due date"}
            </p>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                {view === "overdue" ? "✅" : "📝"}
              </div>
              <p className="text-xl text-gray-600 mb-2">
                {view === "overdue" ? "No overdue tasks!" : "No tasks found"}
              </p>
              <p className="text-gray-500">
                {view === "overdue" ? "Great job keeping up with deadlines!" : "Create your first task to get started!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <div key={task.id}>
                  <TaskItem 
                    task={task} 
                    onUpdateTask={handleUpdateTask} 
                    onDeleteTask={handleDeleteTask}
                    onAssignTask={handleAssignTask}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showTaskForm && (
        <TaskForm 
          onAddTask={handleAddTask} 
          onClose={() => setShowTaskForm(false)}
          currentUserId={currentUser?.id}
        />
      )}
    </div>
  )
}

export default Dashboard;