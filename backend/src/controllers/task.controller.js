// src/controllers/task.controller.js
import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const createTask = async (req, res) => {
  try {
    const { projectId, title, description, status, priority, assignedTo, dueDate } = req.body;

    // Verify project exists and belongs to organization
    const project = await Project.findOne({
      _id: projectId,
      organizationId: req.organizationId
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = new Task({
      organizationId: req.organizationId, // Critical: tenant isolation
      projectId,
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo,
      dueDate,
      createdBy: req.user._id
    });

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;

    const filter = {
      organizationId: req.organizationId // Critical: tenant isolation
    };

    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.organizationId // Critical: tenant isolation
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('projectId', 'name');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.organizationId // Critical: tenant isolation
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('projectId', 'name');

    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['todo', 'in_progress', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.organizationId // Critical: tenant isolation
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = status;
    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('projectId', 'name');

    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.organizationId // Critical: tenant isolation
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await task.deleteOne();

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};