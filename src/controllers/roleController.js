import catchAsync from '../utils/catchAsync.js';
import * as roleService from '../services/roleService.js';
import AppError from '../utils/appError.js';

export const getRoles = catchAsync(async (req, res, next) => {
  const roles = await roleService.getAllRoles();
  if (!roles) return next(new AppError('No roles found', 404));
  res.status(200).json({ status: 'success', results: roles.length, data: roles });
});

export default { getRoles };
