// src/middlewares/tenant.middleware.js
export const tenantIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Get organizationId from user's current organization
  const organizationId = req.user.currentOrganizationId;
  
  if (!organizationId) {
    return res.status(400).json({ 
      error: 'No organization selected. Please select an organization first.' 
    });
  }

  // Verify user belongs to this organization
  const isMember = req.user.organizations.some(
    org => org.organizationId.toString() === organizationId.toString()
  );

  if (!isMember) {
    return res.status(403).json({ 
      error: 'You do not have access to this organization' 
    });
  }

  // Attach organizationId to request for use in controllers
  req.organizationId = organizationId;
  next();
};

// Check if user has admin or owner role in current organization
export const requireAdmin = (req, res, next) => {
  const orgMembership = req.user.organizations.find(
    org => org.organizationId.toString() === req.organizationId.toString()
  );

  if (!orgMembership || !['admin', 'owner'].includes(orgMembership.role)) {
    return res.status(403).json({ 
      error: 'Admin privileges required' 
    });
  }

  next();
};