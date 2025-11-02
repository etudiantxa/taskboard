// src/controllers/project.controller.js
import Project from '../models/Project.js';
import Task from '../models/Task.js';

export const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const project = new Project({
      organizationId: req.organizationId, // From tenant middleware
      name,
      description,
      members: members || [req.user._id],
      createdBy: req.user._id
    });

    await project.save();

    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = { 
      organizationId: req.organizationId // Critical: tenant isolation
    };

    if (status) {
      filter.status = status;
    }

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      organizationId: req.organizationId // Critical: tenant isolation
    })
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, description, status, members } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      organizationId: req.organizationId // Critical: tenant isolation
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (members) project.members = members;

    await project.save();

    await project.populate('createdBy', 'name email');
    await project.populate('members', 'name email');

    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      organizationId: req.organizationId // Critical: tenant isolation
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete all tasks in this project
    await Task.deleteMany({ 
      projectId: project._id,
      organizationId: req.organizationId 
    });

    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};