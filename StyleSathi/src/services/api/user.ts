import { apiClient } from './client';

export const getUserProfile = async () => {
  const response = await apiClient.get('/user/me');
  console.log("Response",response.data)
  return response.data;
};

export const updateUserProfile = async (data: any) => {
  const response = await apiClient.patch('/user/me/update', data);
  return response.data;
};

export const getUserTries = async () => {
  const response = await apiClient.get('/user/me/tries');
  return response.data;
};