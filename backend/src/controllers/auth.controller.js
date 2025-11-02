// src/controllers/auth.controller.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {
  try {
    const { email, password, name, organizationName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const user = new User({ email, password, name });
    await user.save();

    // Create default organization
    const slug = organizationName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const organization = new Organization({
      name: organizationName,
      slug,
      ownerId: user._id,
      members: [user._id]
    });
    await organization.save();

    // Update user with organization
    user.organizations.push({
      organizationId: organization._id,
      role: 'owner'
    });
    user.currentOrganizationId = organization._id;
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        currentOrganizationId: user.currentOrganizationId,
        organizations: user.organizations
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        currentOrganizationId: user.currentOrganizationId,
        organizations: user.organizations
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('organizations.organizationId', 'name slug');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const switchOrganization = async (req, res) => {
  try {
    const { organizationId } = req.body;

    // Verify user belongs to this organization
    const isMember = req.user.organizations.some(
      org => org.organizationId.toString() === organizationId
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied to this organization' });
    }

    // Update current organization
    req.user.currentOrganizationId = organizationId;
    await req.user.save();

    res.json({ 
      message: 'Organization switched successfully',
      currentOrganizationId: organizationId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};