// src/controllers/organization.controller.js
import Organization from '../models/Organization.js';
import User from '../models/User.js';

export const createOrganization = async (req, res) => {
  try {
    const { name } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    const organization = new Organization({
      name,
      slug,
      ownerId: req.user._id,
      members: [req.user._id]
    });

    await organization.save();

    // Add organization to user
    req.user.organizations.push({
      organizationId: organization._id,
      role: 'owner'
    });
    
    // Set as current organization if it's the first one
    if (!req.user.currentOrganizationId) {
      req.user.currentOrganizationId = organization._id;
    }
    
    await req.user.save();

    res.status(201).json({ organization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrganizations = async (req, res) => {
  try {
    const orgIds = req.user.organizations.map(org => org.organizationId);
    const organizations = await Organization.find({ _id: { $in: orgIds } })
      .select('name slug ownerId')
      .lean();

    // Add role information
    const orgsWithRoles = organizations.map(org => {
      const membership = req.user.organizations.find(
        m => m.organizationId.toString() === org._id.toString()
      );
      return {
        ...org,
        role: membership?.role
      };
    });

    res.json({ organizations: orgsWithRoles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('members', 'name email')
      .populate('ownerId', 'name email');

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user has access
    const isMember = organization.members.some(
      member => member._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ organization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const { name, settings } = req.body;
    
    const organization = await Organization.findById(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (name) organization.name = name;
    if (settings) organization.settings = { ...organization.settings, ...settings };

    await organization.save();

    res.json({ organization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;
    const organizationId = req.params.id;

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const organization = await Organization.findById(organizationId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if already a member
    const isAlreadyMember = organization.members.some(
      memberId => memberId.toString() === user._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add to organization
    organization.members.push(user._id);
    await organization.save();

    // Add to user
    user.organizations.push({
      organizationId: organization._id,
      role
    });
    await user.save();

    res.json({ 
      message: 'Member invited successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};