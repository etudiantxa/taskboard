// src/pages/TaskBoard.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksAPI } from '../api/tasks';
import { projectsAPI } from '../api/projects';
import { useAuthStore } from '../store/authStore';

const TaskBoard = () => {
  const queryClient = useQueryClient();
  const { currentOrganization, user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState('all');
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo'
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsAPI.getAll();
      return response.data.projects;
    },
    enabled: !!currentOrganization,
  });

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', selectedProject],
    queryFn: async () => {
      const params = selectedProject !== 'all' ? { projectId: selectedProject } : {};
      const response = await tasksAPI.getAll(params);
      return response.data.tasks;
    },
    enabled: !!currentOrganization,
  });

  const createMutation = useMutation({
    mutationFn: (data) => tasksAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setShowModal(false);
      setFormData({
        projectId: '',
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo'
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => tasksAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tasksAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(id);
    }
  };

  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select an organization to view tasks</p>
      </div>
    );
  }

  const projects = projectsData || [];
  const tasks = tasksData || [];

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const TaskCard = ({ task }) => (
    <div className="bg-white rounded-lg shadow p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 flex-1">{task.title}</h4>
        <button
          onClick={() => handleDelete(task._id)}
          className="text-gray-400 hover:text-red-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(task._id, e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {task.projectId && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">{task.projectId.name}</p>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
          <p className="text-gray-600 mt-2">Manage tasks across all projects</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                To Do
              </h2>
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-medium">
                {todoTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {todoTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">No tasks</p>
              ) : (
                todoTasks.map(task => <TaskCard key={task._id} task={task} />)
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                In Progress
              </h2>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-medium">
                {inProgressTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {inProgressTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">No tasks</p>
              ) : (
                inProgressTasks.map(task => <TaskCard key={task._id} task={task} />)
              )}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Done
              </h2>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                {doneTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {doneTasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">No tasks</p>
              ) : (
                doneTasks.map(task => <TaskCard key={task._id} task={task} />)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  required
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Fix login bug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Task details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      projectId: '',
                      title: '',
                      description: '',
                      priority: 'medium',
                      status: 'todo'
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-medium"
                >
                  {createMutation.isLoading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;