import {put} from 'utils/axios';

export const updateProfile = async (id, data) => {
  try {
    const requestData = { id, ...data };
    if (data.avatar && data.avatar.id) {
      requestData.avatar = data.avatar.id;
    }
    const response = await put('/api/profile', requestData);

    if (response?.success) {
      return response.data;
    }
    return { error: response.error };
  } catch (error) {
    console.error('updateProfile failed', error);
    return { error };
  }
};
