import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  GET_TASKS_QUERY,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
} from "../graphql/queries";

// Configuration data — drives the UI without hard-coding it in JSX
const STATUS_COLUMNS = [
  { key: "todo", label: "To Do", accent: "border-gray-600" },
  { key: "in-progress", label: "In Progress", accent: "border-yellow-500" },
  { key: "done", label: "Done", accent: "border-green-500" },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [showForm, setShowForm] = useState(false);

  // useQuery runs the query when the component mounts (and when deps change)
  // data    — the result ({ getTasks: [...] })
  // loading — true while the request is in-flight
  // error   — any GraphQL or network error
  // refetch — function to re-run the query on demand
  const { data, loading, error, refetch } = useQuery(GET_TASKS_QUERY);

  // One useMutation hook per operation
  const [createTask] = useMutation(CREATE_TASK_MUTATION);
  const [updateTask] = useMutation(UPDATE_TASK_MUTATION);
  const [deleteTask] = useMutation(DELETE_TASK_MUTATION);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createTask({ variables: { title: newTitle, description: newDesc } });
    setNewTitle("");
    setNewDesc("");
    setShowForm(false);
    refetch(); // Re-fetch tasks so the new one appears
  };

  const handleStatus = async (id, status) => {
    await updateTask({ variables: { id, status } });
    refetch();
  };

  const handleDelete = async (id) => {
    await deleteTask({ variables: { id } });
    refetch();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-indigo-400 animate-pulse">Loading tasks...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-red-400">Error: {error.message}</p>
      </div>
    );

  const tasks = data?.getTasks || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">TaskBoard</h1>
          <p className="text-gray-400 text-sm">Welcome, {user?.username}</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + New Task
          </button>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      {/* New Task Modal — showForm controls whether this renders */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold mb-4">New Task</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATUS_COLUMNS.map((col) => {
            // Filter tasks for this column
            const colTasks = tasks.filter((t) => t.status === col.key);

            return (
              <div
                key={col.key}
                className={`bg-gray-900 rounded-2xl p-4 border-t-2 ${col.accent}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-300 text-sm">
                    {col.label}
                  </h2>
                  <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <div key={task.id} className="bg-gray-800 rounded-xl p-4">
                      <h3 className="font-medium text-sm mb-1">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Status dropdown — onChange triggers updateTask */}
                      <select
                        value={task.status}
                        onChange={(e) => handleStatus(task.id, e.target.value)}
                        className="w-full bg-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 mb-2 border border-gray-600 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-400 hover:text-red-300 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <p className="text-gray-600 text-xs text-center py-8">
                      Empty
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
