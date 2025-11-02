import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

/**
 * Middleware d’authentification : vérifie le token JWT et attache l'utilisateur à req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware d’isolation multi-tenant : vérifie que l'utilisateur appartient à l'organisation du paramètre :id
 */
export const tenantIsolation = async (req, res, next) => {
  try {
    // Lecture flexible de l'organizationId
    const orgId =
      req.params.id ||                    // pour routes avec :id
      req.params.organizationId ||       // si tu changes la route pour /projects/:organizationId
      req.body.organizationId ||         // depuis le body (Postman ou frontend)
      req.query.organizationId ||        // depuis query params
      req.user?.currentOrganizationId;   // fallback automatique

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const organization = await Organization.findById(orgId);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Vérifie si l’utilisateur appartient à cette organisation
    const isMember = organization.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied to this organization' });
    }

    req.organization = organization;
    req.organizationId = organization._id; // pour tes contrôleurs
    next();
  } catch (error) {
    console.error('Tenant isolation failed:', error);
    return res.status(500).json({ error: 'Tenant isolation failed', details: error.message });
  }
};


/**
 * Middleware de vérification du rôle administrateur
 */
export const requireAdmin = (req, res, next) => {
  const { user, organization } = req;

  if (!organization || !user) {
    return res.status(400).json({ error: 'Organization or user not found in request' });
  }

  // Cherche le membre dans l’organisation
  const member = organization.members.find(
    (m) => m.user.toString() === user._id.toString()
  );

  if (!member || member.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  next();
};
