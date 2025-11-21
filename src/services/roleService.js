import Role from '../models/roleModel.js';

/**
 * Get all roles from DB
 * @param {Object} filter optional mongoose filter
 * @returns {Promise<Array>} roles
 */
export const getAllRoles = async (filter = {}) => {
  return Role.find(filter).select('-__v').lean();
};

export default { getAllRoles };
