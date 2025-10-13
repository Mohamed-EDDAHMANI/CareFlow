// utils/cacheUser.js
import redisClient from '../config/redis.js';
import AppError from './appError.js';

export const cacheUser = async (user) => {
  if (!user) return;

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    status: user.status,
    permissions: user.permissions
  };

  await redisClient.set(`user:${user._id}`, JSON.stringify(userData), {
    EX: 1800
  });
};



export const deleteCache = async (user) => {
    await redisClient.del(`user:${user._id}`);
};
