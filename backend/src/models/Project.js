// src/models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true // Critical for multi-tenant isolation
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Compound index for efficient queries
projectSchema.index({ organizationId: 1, status: 1 });

export default mongoose.model('Project', projectSchema);
